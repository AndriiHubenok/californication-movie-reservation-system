from django.urls import path, include
from rest_framework import routers

from cinemas.views import CinemaViewSet, HallViewSet

router = routers.DefaultRouter()
router.register(r'cinemas', CinemaViewSet, basename='cinema')
router.register(r'halls', HallViewSet, basename='hall')

urlpatterns = [
    path('', include(router.urls))
]
