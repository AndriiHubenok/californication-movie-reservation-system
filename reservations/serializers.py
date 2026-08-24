from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from movies.models import Showtime, Seat
from reservations.models import Reservation, Payment
from .tasks import cancel_unpaid_reservation


class ReservationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Reservation
        fields = ['id', 'showtime', 'seat', 'status', 'created_at']
        read_only_fields = ['status', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        showtime = validated_data['showtime']
        seat_instance = validated_data['seat']

        with transaction.atomic():

            locked_seat = Seat.objects.select_for_update().get(id=seat_instance.id)

            is_taken = Reservation.objects.filter(
                showtime=showtime,
                seat=locked_seat,
                status__in=['pending', 'confirmed']
            ).exists()

            if is_taken:
                raise ValidationError({"seat": "This seat is already reserved for the selected showtime."})

            reservation = Reservation.objects.create(
                user=user,
                showtime=showtime,
                seat=locked_seat,
                status='pending'
            )
            cancel_unpaid_reservation.apply_async((reservation.id,), countdown=900)

        return reservation

    def validate(self, attrs):
        showtime = attrs.get('showtime')
        seat = attrs.get('seat')

        if showtime.hall != seat.hall:
            raise serializers.ValidationError("The selected seat does not belong to the hall of the selected showtime.")

        if Reservation.objects.filter(showtime=showtime, seat=seat).exists():
            raise serializers.ValidationError("This seat is already reserved for the selected showtime.")

        return attrs

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'user', 'reservation', 'amount', 'status', 'created_at']
        read_only_fields = fields