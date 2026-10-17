from rest_framework import serializers
from rest_framework_gis.serializers import GeoFeatureModelSerializer

from cinemas.models import Cinema
from movies.serializers import HallSerializer

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
