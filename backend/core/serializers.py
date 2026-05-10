from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import serializers

from .models import (
    Activity,
    City,
    PackingItem,
    StopActivity,
    Trip,
    TripNote,
    TripStop,
    UserProfile,
)
from .utils import CURRENCY_CODE, format_inr

User = get_user_model()


class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = "__all__"


class ActivitySerializer(serializers.ModelSerializer):
    city_name = serializers.CharField(source="city.name", read_only=True)
    currency = serializers.SerializerMethodField()
    estimated_cost_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = "__all__"

    def get_currency(self, obj) -> str:
        return CURRENCY_CODE

    def get_estimated_cost_formatted(self, obj) -> str:
        return format_inr(obj.estimated_cost)


class StopActivitySerializer(serializers.ModelSerializer):
    activity_detail = ActivitySerializer(source="activity", read_only=True)
    final_estimated_cost = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    final_estimated_cost_formatted = serializers.SerializerMethodField()

    class Meta:
        model = StopActivity
        fields = "__all__"

    def get_final_estimated_cost(self, obj) -> float:
        return float(obj.estimated_cost_override or obj.activity.estimated_cost)

    def get_currency(self, obj) -> str:
        return CURRENCY_CODE

    def get_final_estimated_cost_formatted(self, obj) -> str:
        return format_inr(obj.estimated_cost_override or obj.activity.estimated_cost)

    def validate(self, attrs):
        instance = self.instance
        trip_stop = attrs.get("trip_stop") or getattr(instance, "trip_stop", None)
        day_date = attrs.get("day_date") or getattr(instance, "day_date", None)
        request = self.context.get("request")

        if request and request.user.is_authenticated and trip_stop:
            if trip_stop.trip.user_id != request.user.id:
                raise serializers.ValidationError({"trip_stop": "This stop does not belong to you."})

        if trip_stop and day_date and not (trip_stop.start_date <= day_date <= trip_stop.end_date):
            raise serializers.ValidationError(
                {"day_date": "Activity date must fall within the selected stop dates."}
            )

        return attrs


class TripStopSerializer(serializers.ModelSerializer):
    city_detail = CitySerializer(source="city", read_only=True)
    stop_activities = StopActivitySerializer(many=True, read_only=True)
    duration_days = serializers.IntegerField(read_only=True)

    class Meta:
        model = TripStop
        fields = "__all__"

    def validate(self, attrs):
        instance = self.instance
        trip = attrs.get("trip") or getattr(instance, "trip", None)
        city = attrs.get("city") or getattr(instance, "city", None)
        start_date = attrs.get("start_date") or getattr(instance, "start_date", None)
        end_date = attrs.get("end_date") or getattr(instance, "end_date", None)
        request = self.context.get("request")

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "Stop end date cannot be before start date."})

        if request and request.user.is_authenticated and trip:
            if trip.user_id != request.user.id:
                raise serializers.ValidationError({"trip": "This trip does not belong to you."})

        if trip and start_date and end_date:
            if start_date < trip.start_date or end_date > trip.end_date:
                raise serializers.ValidationError(
                    {"start_date": "Stop dates must fall within the trip date range."}
                )

        if trip and city:
            duplicate_qs = TripStop.objects.filter(trip=trip, city=city)
            if instance:
                duplicate_qs = duplicate_qs.exclude(pk=instance.pk)
            if duplicate_qs.exists():
                raise serializers.ValidationError(
                    {"city": "This city is already included in the trip stops."}
                )

        return attrs


class PackingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackingItem
        fields = "__all__"

    def validate_trip(self, trip):
        request = self.context.get("request")
        if request and request.user.is_authenticated and trip.user_id != request.user.id:
            raise serializers.ValidationError("This trip does not belong to you.")
        return trip


class TripNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripNote
        fields = "__all__"

    def validate(self, attrs):
        instance = self.instance
        trip = attrs.get("trip") or getattr(instance, "trip", None)
        trip_stop = attrs.get("trip_stop") or getattr(instance, "trip_stop", None)
        request = self.context.get("request")

        if request and request.user.is_authenticated and trip:
            if trip.user_id != request.user.id:
                raise serializers.ValidationError({"trip": "This trip does not belong to you."})

        if trip and trip_stop and trip_stop.trip_id != trip.id:
            raise serializers.ValidationError({"trip_stop": "The note stop must belong to the selected trip."})

        return attrs


class TripSerializer(serializers.ModelSerializer):
    stops = TripStopSerializer(many=True, read_only=True)
    packing_items = PackingItemSerializer(many=True, read_only=True)
    notes = TripNoteSerializer(many=True, read_only=True)
    duration_days = serializers.IntegerField(read_only=True)
    trip_status = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    budget_limit_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]

    def get_trip_status(self, obj) -> str:
        today = timezone.localdate()
        if obj.start_date > today:
            return "upcoming"
        if obj.end_date < today:
            return "completed"
        return "ongoing"

    def get_currency(self, obj) -> str:
        return CURRENCY_CODE

    def get_budget_limit_formatted(self, obj) -> str:
        return format_inr(obj.budget_limit)

    def validate(self, attrs):
        start_date = attrs.get("start_date") or getattr(self.instance, "start_date", None)
        end_date = attrs.get("end_date") or getattr(self.instance, "end_date", None)
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "Trip end date cannot be before start date."})
        return attrs


class AIItineraryRequestSerializer(serializers.Serializer):
    destination = serializers.CharField(help_text="Primary destination or route request.")
    budget = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    number_of_days = serializers.IntegerField(min_value=1, max_value=60)
    interests = serializers.ListField(
        child=serializers.CharField(),
        allow_empty=True,
        help_text="Travel interests such as food, culture, adventure, or nightlife.",
    )


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["phone", "city", "country", "preferences", "language", "avatar_url"]


class RegisterSerializer(serializers.ModelSerializer):
    """
    Creates a User and an associated UserProfile in one request.
    Profile fields (phone, city, country, preferences) are all optional.
    """
    phone = serializers.CharField(required=False, allow_blank=True, default="")
    city = serializers.CharField(required=False, allow_blank=True, default="")
    country = serializers.CharField(required=False, allow_blank=True, default="")
    preferences = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "phone",
            "city",
            "country",
            "preferences",
        ]
        extra_kwargs = {
            "password": {"write_only": True},
            "email": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        phone = validated_data.pop("phone", "")
        city = validated_data.pop("city", "")
        country = validated_data.pop("country", "")
        preferences = validated_data.pop("preferences", "")

        user = User.objects.create_user(**validated_data)

        UserProfile.objects.create(
            user=user,
            phone=phone,
            city=city,
            country=country,
            preferences=preferences,
        )

        return user
