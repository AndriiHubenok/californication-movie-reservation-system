import uuid

import stripe
from django.db import transaction
from django.shortcuts import render
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from reservations.models import Reservation, Payment
from reservations.permissions import IsStaff
from reservations.serializers import ReservationSerializer, PaymentSerializer, CardPaymentSerializer
from reservations.services import ticket_service
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

                    ticket_service.generate_ticket_pdf(reservation)

                    send_reservation_email.delay(
                        reservation.id, reservation.user.email, self.request.user.id, payment_intent.id
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

    @action(detail=False, methods=['get'], permission_classes=[IsStaff])
    def validate(self, request, pk=None):
        qr_data = request.query_params.get('qr_data')

        if not qr_data:
            return Response({"error": "QR code data is required."}, status=status.HTTP_400_BAD_REQUEST)

        ticket_token = ticket_service.validate_scanned_ticket(qr_data)

        try:
            reservation = Reservation.objects.get(ticket_token=ticket_token)
        except Reservation.DoesNotExist:
            return Response({"error": "Invalid ticket token."}, status=status.HTTP_404_NOT_FOUND)

        if reservation.status != 'confirmed':
            return Response({"error": "This reservation is not confirmed."}, status=status.HTTP_400_BAD_REQUEST)

        if reservation.is_used:
            return Response({"error": "This ticket has already been used."}, status=status.HTTP_400_BAD_REQUEST)

        reservation.is_used = True
        reservation.used_at = timezone.now()
        reservation.save()

        return Response({
            "message": "Ticket validated successfully.",
            "reservation_id": reservation.id,
            "movie_title": reservation.showtime.movie.title,
            "showtime": reservation.showtime.start_time,
            "seat": str(reservation.seat),
            "user": reservation.user.username
        }, status=status.HTTP_200_OK)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]