from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db.models import QuerySet
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from cinemas import permissions
from cinemas.models import Cinema
from cinemas.serializers import CinemaSerializer, CinemaDetailSerializer, CinemaLocationSerializer


class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
    permission_classes = [permissions.IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()

        movie_id = self.request.query_params.get("movie_id")
        if movie_id:
            queryset = queryset.filter(halls__showtimes__movie_id=movie_id).distinct()

        movie_name = self.request.query_params.get("movie_name")
        if movie_name:
            queryset = queryset.filter(halls__showtimes__movie__title__icontains=movie_name).distinct()

        return queryset

    def get_serializer_class(self):
        if self.action in ["retrieve", "info"]:
            return CinemaDetailSerializer
        return CinemaSerializer

    @action(detail=False, methods=["get"])
    def map(self, request):
        cinemas = self.get_queryset()
        serializer = CinemaLocationSerializer(cinemas, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def nearby(self, request):
        cinemas = self.get_queryset()

        user_lon = request.query_params.get("lon")
        user_lat = request.query_params.get("lat")
        if user_lon is None or user_lat is None:
            return Response({"error": "Latitude and longitude are required."}, status=400)

        target_point = Point(float(user_lon), float(user_lat), srid=4326)
        cinemas = (cinemas
                   .annotate(distance=Distance("location", target_point))
                   .order_by('distance'))

        movie_id = request.query_params.get("movie_id")
        if movie_id:
            cinemas = cinemas.filter(halls__showtimes__movie_id=movie_id).distinct()

        radius = request.query_params.get("radius")
        if radius:
            cinemas = cinemas.filter(location__distance_lte=(target_point, D(km=float(radius))))

        serializer = CinemaLocationSerializer(cinemas, many=True)
        return Response(serializer.data)


