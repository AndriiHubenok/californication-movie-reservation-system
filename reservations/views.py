import stripe
from django.db import transaction
from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from reservations.models import Reservation, Payment
from reservations.serializers import ReservationSerializer, PaymentSerializer, CardPaymentSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Reservation.objects.all()
        return Reservation.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        reservation = self.get_object()

        card_serializer = CardPaymentSerializer(data=request.data)
        if not card_serializer.is_valid():
            return Response(card_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        card_data = card_serializer.validated_data

        if reservation.user != self.request.user:
            return Response({"error": "You are not authorized to perform this action."}, status=401)

        if reservation.status == 'cancelled':
            return Response({"error": "This reservation is already cancelled. Please try again create new reservation."}, status=400)

        if reservation.status == 'confirmed':
            return Response({"error": "This reservation is already confirmed."}, status=400)

        if card_data['value'] < reservation.showtime.price:
            return Response({"error": "Not enough money"}, status=400)

        if card_data['value'] > reservation.showtime.price:
            return Response({"error": "Too much money"}, status=400)

        amount_in_cents = int(card_data['value'] * 100)

        with transaction.atomic():

            try:
                payment_intent = stripe.PaymentIntent.create(
                    amount=amount_in_cents,
                    currency="usd",
                    payment_method="pm_card_visa",
                    confirm=True,
                    automatic_payment_methods={
                        "enabled": True,
                        "allow_redirects": "never"
                    }
                )

                if payment_intent.status == 'succeeded':
                    payment = Payment.objects.create(
                        transaction_id=payment_intent.id,
                        user=self.request.user,
                        amount=reservation.showtime.price,
                        reservation=reservation,
                        status='confirmed',
                    )
                    reservation.status = 'confirmed'
                    reservation.save()

                    serializer = PaymentSerializer(payment)
                    return Response(serializer.data, status=201)

                return Response(
                    {"error": f"Payment failed with status: {payment_intent.status}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            except stripe.error.CardError as e:
                return Response({"error": e.user_message}, status=status.HTTP_400_BAD_REQUEST)

            except stripe.error.StripeError as e:
                return Response({"error": "Payment provider is currently unavailable."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]