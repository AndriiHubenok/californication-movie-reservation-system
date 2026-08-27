from django.urls import path, include
from rest_framework.routers import DefaultRouter

from reservations.views import ReservationViewSet, PaymentViewSet
from reservations.webhooks import stripe_webhook

router = DefaultRouter()
router.register(r'reservations', ReservationViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('webhook/stripe/', stripe_webhook, name='stripe-webhook'),
]