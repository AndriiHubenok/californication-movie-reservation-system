from typing import Any

from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from cinemas.models import Cinema, Hall, Seat


class HallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = ["id", "name", "total_seats", "rows"]

    def validate(self, attrs: Any) -> Any:
        total_seats = attrs.get("total_seats")
        rows = attrs.get("rows")

        if total_seats is not None and rows is not None:
            if total_seats < rows:
                raise serializers.ValidationError({"total_seats": "Total seats cannot be less than the number of rows."})
            if total_seats % rows != 0:
                raise serializers.ValidationError({"total_seats": "Total seats must be divisible by the number of rows."})

        return attrs

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ["id", "hall", "row", "number"]

    def validate(self, attrs: Any) -> Any:
        hall = attrs.get("hall")
        row = attrs.get("row")
        number = attrs.get("number")

        if hall is not None and row is not None and number is not None:
            if row > hall.rows:
                raise serializers.ValidationError({"row": f"Row must be between 1 and {hall.rows}."})
            seats_per_row = hall.total_seats // hall.rows
            if number > seats_per_row:
                raise serializers.ValidationError({"number": f"Seat number must be between 1 and {seats_per_row}."})

        return attrs

class CinemaSerializer(serializers.ModelSerializer):

    halls_count = serializers.IntegerField(source="halls.count", read_only=True)

    class Meta:
        model = Cinema
        id_field = "id"
        fields = ["id", "name", "address", "halls_count"]

class CinemaLocationSerializer(GeoFeatureModelSerializer):

    class Meta:
        model = Cinema
        geo_field = "location"
        id_field = "id"
        fields = ["id", "name", "address"]

class CinemaDetailSerializer(serializers.ModelSerializer):
    halls = HallSerializer(many=True, read_only=True)

    class Meta:
        model = Cinema
        id_field = "id"
        fields = ["id", "name", "address", "halls"]