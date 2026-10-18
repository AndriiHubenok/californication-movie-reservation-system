import os
from datetime import timedelta

import requests
from django.db.models import Sum, Count, Q, ExpressionWrapper, F, IntegerField, DecimalField, FloatField, Avg
from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cinema_config.settings import MAILGUN_URL, MAILGUN_API_KEY
from movies.models import Movie, Showtime, Review
from movies.permissions import IsAdminOrReadOnly
from movies.serializers import MovieSerializer, ShowtimeSerializer, ReviewSerializer, PostReviewSerializer
from movies.tasks import delete_completed_showtime
from reservations.models import Reservation


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.annotate(rating=Avg('reviews__grade'))
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()

        genre_id = self.request.query_params.get('genre_id')
        if genre_id:
            queryset = queryset.filter(genres__id=genre_id)

        cinema_id = self.request.query_params.get('cinema_id')
        if cinema_id:
            queryset = queryset.filter(showtimes__hall__cinema__id=cinema_id).distinct()

        return queryset

    @action(detail=True, methods=['get'])
    def info(self, request, pk=None):
        movie = self.get_object()

        showtimes = Showtime.objects.filter(movie=movie).order_by('-start_time')
        reviews = Review.objects.filter(movie=movie).order_by('-points')

        movie_data = {
            "id": movie.id,
            "title": movie.title,
            "description": movie.description,
            "rating": round(movie.rating, 1) if movie.rating else 0.0,
            "poster": movie.poster.url,
            "genres": [genre.name for genre in movie.genres.all()],
            "showtimes":
                [
                    {
                        "id": showtime.id,
                        "start_time": showtime.start_time,
                        "end_time": showtime.end_time,
                        "price": showtime.price,
                    }
                    for showtime in showtimes
                ],
            "reviews":
                [
                    {
                        "id": review.id,
                        "points": review.points,
                        "user_id": review.user.id,
                        "grade": review.grade,
                        "comment": review.comment,
                        "created_at": review.created_at,
                    }
                    for review in reviews
                ],
        }

        return Response(movie_data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def review(self, request, pk=None):
        movie = self.get_object()
        user = request.user

        review_serializer = PostReviewSerializer(data=request.data)
        if not review_serializer.is_valid():
            return Response(review_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        review_data = review_serializer.validated_data

        review = Review.objects.create(
            user=user,
            movie=movie,
            points=0,
            grade=review_data['grade'],
            comment=review_data['comment'],
        )

        serializer = ReviewSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class ShowtimeViewSet(viewsets.ModelViewSet):
    queryset = Showtime.objects.select_related('movie', 'hall').all()
    serializer_class = ShowtimeSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get('date')
        if date:
            queryset = queryset.filter(start_time__date=date)

        cinema_id = self.request.query_params.get('cinema_id')
        if cinema_id:
            queryset = queryset.filter(hall__cinema__id=cinema_id)

        return queryset

    def perform_create(self, serializer):
        showtime = serializer.save()

        delete_completed_showtime.apply_async(
            args=[showtime.id],
            eta=showtime.end_time + timedelta(hours=1),
        )
        print("delete task created")

    @action(detail=True, methods=['get'])
    def available_seats(self, request, pk=None):
        showtime = self.get_object()

        booked_seat_ids = showtime.reservations.filter(
            status__in=['pending', 'confirmed']
        ).values_list('seat_id', flat=True)

        available_seats_qs = showtime.hall.seats.exclude(id__in=booked_seat_ids)

        available_seats_data = [
            {
                "id": seat.id,
                "row": seat.row,
                "number": seat.number
            }
            for seat in available_seats_qs
        ]

        return Response({"available_seats": available_seats_data})

class AdminMovieReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk=None):

        movies_qs = Movie.objects.annotate(
            sold_tickets=Count(
                'showtimes__reservations',
                filter=Q(showtimes__reservations__status='confirmed')
            ),
            revenue=Sum(
                'showtimes__reservations__showtime__price',
                filter=Q(showtimes__reservations__status='confirmed')
            )
        )

        if pk is not None:
            movie = get_object_or_404(movies_qs, pk=pk)

            return Response({
                "id": movie.id,
                "title": movie.title,
                "tickets_sold": movie.sold_tickets,
                "revenue": movie.revenue or 0
            })

        total_stats = Reservation.objects.filter(status='confirmed').aggregate(
            total_revenue=Sum('showtime__price'),
            total_tickets=Count('id')
        )

        movies_report = movies_qs.order_by('-revenue')

        report_data = {
            "overall": {
                "revenue": total_stats['total_revenue'] or 0,
                "tickets_sold": total_stats['total_tickets']
            },
            "by_movie": [
                {
                    "id": movie.id,
                    "title": movie.title,
                    "tickets_sold": movie.sold_tickets,
                    "revenue": movie.revenue or 0
                }
                for movie in movies_report
            ]
        }

        return Response(report_data)

class AdminShowtimeReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk=None):

        showtime_qs = Showtime.objects.select_related('movie', 'hall').annotate(
            sold_tickets=Count(
                'reservations',
                filter=Q(reservations__status='confirmed'),
                distinct=True
            ),
            total_seats=Count(
                'hall__seats',
                distinct=True
            )
        ).annotate(
            available_seats=ExpressionWrapper(
                F('total_seats') - F('sold_tickets'),
                output_field=IntegerField()
            ),
            hall_load=ExpressionWrapper(
                F('sold_tickets') * 100.0 / F('total_seats'),
                output_field=FloatField()
            ),
            revenue=ExpressionWrapper(
                F('sold_tickets') * F('price'),
                output_field=DecimalField(max_digits=10, decimal_places=2)
            )
        )

        if pk is not None:
            showtime = get_object_or_404(showtime_qs, pk=pk)

            return Response({
                "id": showtime.id,
                "movie_id": showtime.movie.id,
                "movie": showtime.movie.title,
                "hall_id": showtime.hall.id,
                "hall": showtime.hall.name,
                "start_time": showtime.start_time,
                "end_time": showtime.end_time,
                "total_seats": showtime.total_seats,
                "tickets_sold": showtime.sold_tickets,
                "available_seats": showtime.available_seats,
                "hall_load": showtime.hall_load,
                "revenue": showtime.revenue or 0,
            })

        showtime_report = showtime_qs.order_by('-revenue')

        total_stats = Reservation.objects.filter(status='confirmed').aggregate(
            total_revenue=Sum('showtime__price'),
            total_tickets=Count('id')
        )

        report_data = {
            "overall": {
                "revenue": total_stats['total_revenue'] or 0,
                "tickets_sold": total_stats['total_tickets']
            },
            "by_movie": [
                {
                    "id": showtime.id,
                    "movie_id": showtime.movie.id,
                    "movie": showtime.movie.title,
                    "hall_id": showtime.hall.id,
                    "hall": showtime.hall.name,
                    "start_time": showtime.start_time,
                    "end_time": showtime.end_time,
                    "total_seats": showtime.total_seats,
                    "tickets_sold": showtime.sold_tickets,
                    "available_seats": showtime.available_seats,
                    "hall_load": showtime.hall_load,
                    "revenue": showtime.revenue or 0,
                }
                for showtime in showtime_report
            ]
        }

        return Response(report_data)