from django.db.models import F, Sum
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Activity, City, PackingItem, StopActivity, Trip, TripNote, TripStop
from .serializers import (
    ActivitySerializer,
    CitySerializer,
    PackingItemSerializer,
    StopActivitySerializer,
    TripNoteSerializer,
    TripSerializer,
    TripStopSerializer,
)


class DefaultPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS or request.user.is_authenticated


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [DefaultPermission]


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.select_related("city").all()
    serializer_class = ActivitySerializer
    permission_classes = [DefaultPermission]


class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    permission_classes = [DefaultPermission]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Trip.objects.filter(user=self.request.user).prefetch_related("stops", "packing_items", "notes")
        return Trip.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["get"])
    def budget(self, request, pk=None):
        trip = self.get_object()
        activity_cost = (
            StopActivity.objects.filter(trip_stop__trip=trip)
            .annotate(final_cost=F("estimated_cost_override"))
            .aggregate(total=Sum("final_cost"))
            .get("total")
            or 0
        )
        fallback_cost = (
            StopActivity.objects.filter(trip_stop__trip=trip, estimated_cost_override__isnull=True)
            .aggregate(total=Sum("activity__estimated_cost"))
            .get("total")
            or 0
        )
        total = float(activity_cost) + float(fallback_cost)
        days = max(trip.duration_days, 1)
        return Response(
            {
                "trip": trip.name,
                "budget_limit": float(trip.budget_limit),
                "estimated_total": total,
                "average_per_day": total / days,
                "is_over_budget": total > float(trip.budget_limit),
            }
        )


class TripStopViewSet(viewsets.ModelViewSet):
    queryset = TripStop.objects.select_related("city", "trip").all()
    serializer_class = TripStopSerializer
    permission_classes = [DefaultPermission]


class StopActivityViewSet(viewsets.ModelViewSet):
    queryset = StopActivity.objects.select_related("activity", "trip_stop").all()
    serializer_class = StopActivitySerializer
    permission_classes = [DefaultPermission]


class PackingItemViewSet(viewsets.ModelViewSet):
    queryset = PackingItem.objects.select_related("trip").all()
    serializer_class = PackingItemSerializer
    permission_classes = [DefaultPermission]


class TripNoteViewSet(viewsets.ModelViewSet):
    queryset = TripNote.objects.select_related("trip", "trip_stop").all()
    serializer_class = TripNoteSerializer
    permission_classes = [DefaultPermission]
