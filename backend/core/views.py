from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Case, Count, DecimalField, IntegerField, Sum, Value, When
from django.db.models.functions import Coalesce
from rest_framework import filters, generics, permissions, status, views, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiExample, OpenApiTypes, extend_schema

from .filters import ActivityFilter, CityFilter, TripFilter
from .models import Activity, City, PackingItem, StopActivity, Trip, TripNote, TripStop, UserProfile
from .serializers import (
    AIItineraryRequestSerializer,
    ActivitySerializer,
    CitySerializer,
    PackingItemSerializer,
    RegisterSerializer,
    StopActivitySerializer,
    TripNoteSerializer,
    TripSerializer,
    TripStopSerializer,
    UserProfileSerializer,
)
from .services.ai_service import ItineraryGenerationService
from .utils import CURRENCY_CODE, format_inr

User = get_user_model()


# ─── Permissions ──────────────────────────────────────────
class DefaultPermission(permissions.BasePermission):
    """Allow read for anyone; write only if authenticated."""
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user.is_authenticated


# ─── Auth ─────────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    """Register a new user with optional profile fields."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


# ─── ViewSets ─────────────────────────────────────────────
class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.annotate(
        india_priority=Case(
            When(country__iexact="India", then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        )
    ).order_by("india_priority", "name")
    serializer_class = CitySerializer
    permission_classes = [DefaultPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CityFilter
    search_fields = ["name"]
    ordering_fields = ["name", "country", "region", "cost_index", "popularity_score"]
    ordering = ["name"]


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.select_related("city").annotate(
        india_priority=Case(
            When(city__country__iexact="India", then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        )
    ).order_by("india_priority", "name")
    serializer_class = ActivitySerializer
    permission_classes = [DefaultPermission]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ActivityFilter
    search_fields = ["name", "description", "city__name"]
    ordering_fields = ["name", "estimated_cost", "duration_hours", "activity_type"]
    ordering = ["name"]


class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.none()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TripFilter
    search_fields = ["name", "description"]
    ordering_fields = ["created_at", "updated_at", "start_date", "end_date", "budget_limit", "name"]
    ordering = ["-created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return Trip.objects.none()
        return (
            Trip.objects.filter(user=self.request.user)
            .prefetch_related(
                "packing_items",
                "notes",
                "stops__city",
                "stops__stop_activities__activity__city",
            )
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get"])
    def budget(self, request, pk=None):
        trip = self.get_object()
        activities = StopActivity.objects.filter(trip_stop__trip=trip).select_related("activity")
        priced_activities = activities.annotate(
            final_cost=Coalesce(
                "estimated_cost_override",
                "activity__estimated_cost",
                output_field=DecimalField(max_digits=10, decimal_places=2),
            )
        )

        total_activities_cost = priced_activities.aggregate(total=Sum("final_cost")).get("total") or 0
        category_breakdown = {
            row["activity__activity_type"]: float(row["total"] or 0)
            for row in priced_activities.values("activity__activity_type")
            .annotate(total=Sum("final_cost"))
            .order_by("activity__activity_type")
        }
        total = float(total_activities_cost)
        budget_limit = float(trip.budget_limit)
        days = max(trip.duration_days, 1)
        overbudget_amount = max(total - budget_limit, 0)

        return Response(
            {
                "trip": {"id": trip.id, "name": trip.name},
                "currency": CURRENCY_CODE,
                "budget_limit": budget_limit,
                "budget_limit_formatted": format_inr(budget_limit),
                "estimated_total": total,
                "estimated_total_formatted": format_inr(total),
                "total_activities_cost": total,
                "total_activities_cost_formatted": format_inr(total),
                "total_trip_days": days,
                "average_per_day": round(total / days, 2),
                "average_per_day_formatted": format_inr(total / days),
                "is_over_budget": total > budget_limit,
                "overbudget_amount": round(overbudget_amount, 2),
                "overbudget_amount_formatted": format_inr(overbudget_amount),
                "overbudget_percentage": round((overbudget_amount / budget_limit) * 100, 2)
                if budget_limit
                else 0,
                "category_breakdown": category_breakdown,
                "category_breakdown_formatted": {
                    category: format_inr(amount) for category, amount in category_breakdown.items()
                },
            }
        )


class TripStopViewSet(viewsets.ModelViewSet):
    queryset = TripStop.objects.none()
    serializer_class = TripStopSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return TripStop.objects.none()
        return (
            TripStop.objects.filter(trip__user=self.request.user)
            .select_related("city", "trip")
            .prefetch_related("stop_activities__activity__city")
        )


class StopActivityViewSet(viewsets.ModelViewSet):
    queryset = StopActivity.objects.none()
    serializer_class = StopActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return StopActivity.objects.none()
        return StopActivity.objects.filter(trip_stop__trip__user=self.request.user).select_related(
            "activity__city", "trip_stop__trip", "trip_stop__city"
        )


class PackingItemViewSet(viewsets.ModelViewSet):
    queryset = PackingItem.objects.none()
    serializer_class = PackingItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return PackingItem.objects.none()
        return PackingItem.objects.filter(trip__user=self.request.user).select_related("trip")


class TripNoteViewSet(viewsets.ModelViewSet):
    queryset = TripNote.objects.none()
    serializer_class = TripNoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or not self.request.user.is_authenticated:
            return TripNote.objects.none()
        return TripNote.objects.filter(trip__user=self.request.user).select_related(
            "trip", "trip_stop__city"
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's travel profile."""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class AIItineraryGenerateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        request=AIItineraryRequestSerializer,
        responses={200: OpenApiTypes.OBJECT},
        examples=[
            OpenApiExample(
                "Generate itinerary",
                value={
                    "destination": "Goa",
                    "budget": "25000.00",
                    "number_of_days": 5,
                    "interests": ["beach", "food", "culture"],
                },
                request_only=True,
            )
        ],
    )
    def post(self, request):
        serializer = AIItineraryRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        itinerary = ItineraryGenerationService().generate(**serializer.validated_data)
        return Response(itinerary, status=status.HTTP_200_OK)


class AnalyticsOverviewView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses={200: OpenApiTypes.OBJECT})
    def get(self, request):
        trips = Trip.objects.filter(user=request.user)
        trip_ids = trips.values("id")

        activity_costs = (
            StopActivity.objects.filter(trip_stop__trip_id__in=trip_ids)
            .annotate(
                final_cost=Coalesce(
                    "estimated_cost_override",
                    "activity__estimated_cost",
                    output_field=DecimalField(max_digits=10, decimal_places=2),
                )
            )
            .aggregate(total=Sum("final_cost"))
            .get("total")
            or 0
        )
        most_visited_cities = list(
            TripStop.objects.filter(trip__user=request.user)
            .values("city__id", "city__name", "city__country")
            .annotate(visits=Count("id"))
            .order_by("-visits", "city__name")[:10]
        )
        activity_distribution = list(
            StopActivity.objects.filter(trip_stop__trip__user=request.user)
            .values("activity__activity_type")
            .annotate(count=Count("id"))
            .order_by("activity__activity_type")
        )
        trip_durations = [trip.duration_days for trip in trips.only("start_date", "end_date")]

        return Response(
            {
                "currency": CURRENCY_CODE,
                "total_trips": trips.count(),
                "total_estimated_spending": float(activity_costs),
                "total_estimated_spending_formatted": format_inr(activity_costs),
                "most_visited_cities": most_visited_cities,
                "activity_category_distribution": activity_distribution,
                "average_trip_duration": round(sum(trip_durations) / len(trip_durations), 2)
                if trip_durations
                else 0,
            }
        )


# ─── Public Trip ──────────────────────────────────────────
@extend_schema(responses={200: TripSerializer})
@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def public_trip_view(request, trip_id):
    try:
        trip = Trip.objects.prefetch_related(
            "packing_items",
            "notes",
            "stops__city",
            "stops__stop_activities__activity__city",
        ).get(id=trip_id, visibility="public")
    except Trip.DoesNotExist:
        return Response(
            {"detail": "public trip not found"},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(TripSerializer(trip).data)


@extend_schema(request=None, responses={201: TripSerializer})
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def copy_public_trip_view(request, trip_id):
    try:
        source_trip = (
            Trip.objects.prefetch_related(
                "packing_items",
                "notes",
                "stops__stop_activities",
            )
            .select_related("user")
            .get(id=trip_id, visibility="public")
        )
    except Trip.DoesNotExist:
        return Response({"detail": "public trip not found"}, status=status.HTTP_404_NOT_FOUND)

    with transaction.atomic():
        copied_trip = Trip.objects.create(
            user=request.user,
            name=f"Copy of {source_trip.name}",
            description=source_trip.description,
            start_date=source_trip.start_date,
            end_date=source_trip.end_date,
            budget_limit=source_trip.budget_limit,
            visibility="private",
            cover_photo_url=source_trip.cover_photo_url,
        )

        stop_map = {}
        for stop in source_trip.stops.all():
            copied_stop = TripStop.objects.create(
                trip=copied_trip,
                city=stop.city,
                start_date=stop.start_date,
                end_date=stop.end_date,
                order=stop.order,
            )
            stop_map[stop.id] = copied_stop

            StopActivity.objects.bulk_create(
                [
                    StopActivity(
                        trip_stop=copied_stop,
                        activity=stop_activity.activity,
                        day_date=stop_activity.day_date,
                        start_time=stop_activity.start_time,
                        estimated_cost_override=stop_activity.estimated_cost_override,
                    )
                    for stop_activity in stop.stop_activities.all()
                ]
            )

        PackingItem.objects.bulk_create(
            [
                PackingItem(
                    trip=copied_trip,
                    title=item.title,
                    category=item.category,
                    is_packed=False,
                )
                for item in source_trip.packing_items.all()
            ]
        )
        TripNote.objects.bulk_create(
            [
                TripNote(
                    trip=copied_trip,
                    trip_stop=stop_map.get(note.trip_stop_id),
                    title=note.title,
                    content=note.content,
                )
                for note in source_trip.notes.all()
            ]
        )

    return Response(TripSerializer(copied_trip, context={"request": request}).data, status=status.HTTP_201_CREATED)
