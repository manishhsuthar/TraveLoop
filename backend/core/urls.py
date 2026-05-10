from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    AIItineraryGenerateView,
    ActivityViewSet,
    AnalyticsOverviewView,
    CityViewSet,
    PackingItemViewSet,
    ProfileView,
    RegisterView,
    StopActivityViewSet,
    TripNoteViewSet,
    TripStopViewSet,
    TripViewSet,
    copy_public_trip_view,
    public_trip_view,
)

router = DefaultRouter()
router.register("cities", CityViewSet)
router.register("activities", ActivityViewSet)
router.register("trips", TripViewSet, basename="trip")
router.register("stops", TripStopViewSet, basename="stop")
router.register("stop-activities", StopActivityViewSet, basename="stop-activity")
router.register("packing-items", PackingItemViewSet, basename="packing-item")
router.register("notes", TripNoteViewSet, basename="note")

urlpatterns = [
    # Auth (JWT)
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("ai/generate-itinerary/", AIItineraryGenerateView.as_view(), name="ai_generate_itinerary"),
    path("analytics/overview/", AnalyticsOverviewView.as_view(), name="analytics_overview"),

    # Public
    path("public/trips/<int:trip_id>/copy/", copy_public_trip_view, name="copy_public_trip"),
    path("public/trips/<int:trip_id>/", public_trip_view, name="public_trip"),
]

# CRITICAL: append all router-generated viewset URLs
urlpatterns += router.urls
