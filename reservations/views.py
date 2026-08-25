from django.db import transaction
from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from reservations.models import Reservation, Payment
from reservations.serializers import ReservationSerializer, PaymentSerializer


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

        if reservation.user != self.request.user:
            return Response({"error": "You are not authorized to perform this action."}, status=401)

        if reservation.status == 'cancelled':
            return Response({"error": "This reservation is already cancelled. Please try again create new reservation."}, status=400)

        if reservation.status == 'confirmed':
            return Response({"error": "This reservation is already confirmed."}, status=400)

        with transaction.atomic():
            payment = Payment()
            payment.user = self.request.user
            payment.amount = reservation.showtime.price
            payment.status = 'pending'
            payment.reservation = reservation

            reservation.status = 'confirmed'
            reservation.save()
            payment.status = 'confirmed'
            payment.save()


        serializer = PaymentSerializer(payment)

        return Response(serializer.data, status=201)

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]