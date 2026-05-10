from django.contrib.auth import authenticate, get_user_model
from django.db.models import F, Sum
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
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


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def signup_view(request):
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response({"detail": "username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    user_model = get_user_model()
    if user_model.objects.filter(username=username).exists():
        return Response({"detail": "username already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = user_model.objects.create_user(username=username, email=email, password=password)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")
    user = authenticate(username=username, password=password)
    if not user:
        return Response({"detail": "invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    Token.objects.filter(user=request.user).delete()
    return Response({"detail": "logged out"})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def public_trip_view(request, trip_id):
    try:
        trip = Trip.objects.prefetch_related("stops", "notes", "packing_items").get(id=trip_id, visibility="public")
    except Trip.DoesNotExist:
        return Response({"detail": "public trip not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response(TripSerializer(trip).data)
