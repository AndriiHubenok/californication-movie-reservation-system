from rest_framework import viewsets

from cinemas import permissions
from cinemas.models import Cinema
from cinemas.serializers import CinemaSerializer


class CinemaViewSet(viewsets.ModelViewSet):
    queryset = Cinema.objects.all()
    serializer_class = CinemaSerializer
    permission_classes = [permissions.IsAdminOrReadOnly]
