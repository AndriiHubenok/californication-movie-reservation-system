from django.urls import path

from users.views import RegisterView, UserProfileView, VerifyEmailView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify/<str:uidb64>/<str:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('me/', UserProfileView.as_view(), name='profile'),
]