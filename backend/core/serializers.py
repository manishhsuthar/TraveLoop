from rest_framework import serializers
from .models import Activity, City, PackingItem, StopActivity, Trip, TripNote, TripStop


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"


class ActivitySerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source="city.name", read_only=True)

    class Meta:
        model = Activity
        fields = "__all__"


class StopActivitySerializer(serializers.ModelSerializer):
    activity_detail = ActivitySerializer(source="activity", read_only=True)

    class Meta:
        model = StopActivity
        fields = "__all__"


class TripStopSerializer(serializers.ModelSerializer):
    city_detail = CitySerializer(source="city", read_only=True)
    stop_activities = StopActivitySerializer(many=True, read_only=True)

    class Meta:
        model = TripStop
        fields = "__all__"


class PackingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingItem
        fields = "__all__"


class TripNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripNote
        fields = "__all__"


class TripSerializer(serializers.ModelSerializer):
    stops = TripStopSerializer(many=True, read_only=True)
    packing_items = PackingItemSerializer(many=True, read_only=True)
    notes = TripNoteSerializer(many=True, read_only=True)
    duration_days = serializers.ReadOnlyField()

    class Meta:
        model = Trip
        fields = "__all__"
