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