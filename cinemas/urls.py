from django.urls import path, include
from rest_framework import routers

from cinemas.views import CinemaViewSet

router = routers.DefaultRouter()
router.register(r'cinemas', CinemaViewSet, basename='cinema')

urlpatterns = [
    path('', include(router.urls))
]
