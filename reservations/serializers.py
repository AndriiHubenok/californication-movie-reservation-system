from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from cinemas.models import Seat
from movies.models import Showtime
from reservations.models import Reservation, Payment, Ticket
from .tasks import cancel_unpaid_reservation


class ReservationSerializer(serializers.ModelSerializer):

    seats = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Seat.objects.all(),
        write_only=True
    )

    class Meta:
        model = Reservation
        fields = ['id', 'showtime', 'status', 'tickets', 'created_at']
        read_only_fields = ['status', 'tickets', 'created_at']

    def validate(self, attrs):
        showtime = attrs.get('showtime')
        seats = attrs.get('seats', [])

        if len(seats) <= 0:
            raise serializers.ValidationError("At least one seat must be selected.")

        if not seats:
            raise serializers.ValidationError({"seats": "At least one seat must be selected."})

        for seat in seats:
            if showtime.hall_id != seat.hall_id:
                raise serializers.ValidationError({
                    "seats": f"Seat {seat.id} does not belong to the hall of this showtime."
                })

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        showtime = validated_data['showtime']
        seats = validated_data['seats']
        seat_ids = [seat.id for seat in seats]

        with transaction.atomic():

            locked_seats = Seat.objects.select_for_update().filter(id__in=seat_ids)

            if len(locked_seats) != len(seats):
                raise serializers.ValidationError({"seats": "Some seats were not found."})

            is_taken = Ticket.objects.filter(
                showtime=showtime,
                seat__in=locked_seats
            ).exists()

            if is_taken:
                raise serializers.ValidationError({
                    "seats": f"Seats are already reserved for this showtime."
                })

            created_reservation = Reservation.objects.create(
                user=user,
                showtime=showtime,
                status='pending'
            )

            tickets_to_create = [
                Ticket(
                    user=user,
                    showtime=showtime,
                    seat=seat,
                    reservation=created_reservation
                )
                for seat in locked_seats
            ]

            Ticket.objects.bulk_create(tickets_to_create)

            cancel_unpaid_reservation.apply_async((created_reservation.id,), countdown=900)

        return created_reservation

class ReservationDetailSerializer(serializers.ModelSerializer):
    movie_title = serializers.CharField(source='showtime.movie.title', read_only=True)
    start_time = serializers.DateTimeField(source='showtime.start_time', read_only=True)
    cinema_name = serializers.CharField(source='showtime.hall.cinema', read_only=True)

    class Meta:
        model = Reservation
        fields = ['id', 'showtime', 'status', 'tickets', 'movie_title', 'start_time', 'cinema_name', 'created_at']
        read_only_fields = ['status', 'tickets', 'movie_title', 'start_time', 'cinema_name', 'created_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'transaction_id', 'user', 'reservation', 'amount', 'status', 'created_at']
        read_only_fields = fields

class CardPaymentSerializer(serializers.Serializer):
    payment_method_id = serializers.CharField(max_length=255)