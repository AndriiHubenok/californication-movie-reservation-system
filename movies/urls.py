from django.urls import include, path
from rest_framework.routers import DefaultRouter

from movies.views import MovieViewSet, ShowtimeViewSet, AdminMovieReportView, AdminShowtimeReportView

router = DefaultRouter()
router.register(r'movies', MovieViewSet)
router.register(r'showtimes', ShowtimeViewSet)

urlpatterns = [
    path('reports/movies/', AdminMovieReportView.as_view(), name='admin_movie_reports'),
    path('reports/movies/<int:pk>/', AdminMovieReportView.as_view(), name='movie-report-detail'),
    path('reports/showtimes/', AdminShowtimeReportView.as_view(), name='admin_showtime_reports'),
    path('reports/showtimes/<int:pk>/', AdminShowtimeReportView.as_view(), name='showtime-report-detail'),
    path('', include(router.urls)),
]