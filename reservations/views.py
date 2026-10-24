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
from reservations.services.ticket_generator import generate_ticket_pdf
from reservations.tasks import send_reservation_email


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

        payment_serializer = CardPaymentSerializer(data=request.data)
        if not payment_serializer.is_valid():
            return Response(payment_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        payment_method_id = payment_serializer.validated_data['payment_method_id']

        if reservation.user != self.request.user:
            return Response({"error": "You are not authorized to perform this action."}, status=401)

        if reservation.status == 'cancelled':
            return Response({"error": "This reservation is already cancelled. Please try again create new reservation."}, status=400)

        if reservation.status == 'confirmed':
            return Response({"error": "This reservation is already confirmed."}, status=400)

        amount_in_cents = int(reservation.showtime.price * 100)

        with transaction.atomic():

            try:
                payment_intent = stripe.PaymentIntent.create(
                    amount=amount_in_cents,
                    currency="usd",
                    payment_method=payment_method_id,
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

                    generate_ticket_pdf(reservation)

                    send_reservation_email.delay(
                        reservation.id, 'andrewhu08@gmail.com', self.request.user.id, payment_intent.id
                    )

                    serializer = PaymentSerializer(payment)
                    return Response(serializer.data, status=201)

                elif payment_intent.status == 'requires_action':

                    return Response({
                        "status": "requires_action",
                        "client_secret": payment_intent.client_secret
                    }, status=status.HTTP_200_OK)

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