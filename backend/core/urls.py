from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ActivityViewSet,
    CityViewSet,
    PackingItemViewSet,
    StopActivityViewSet,
    TripNoteViewSet,
    TripStopViewSet,
    TripViewSet,
    login_view,
    logout_view,
    public_trip_view,
    signup_view,
)

router = DefaultRouter()
router.register("cities", CityViewSet)
router.register("activities", ActivityViewSet)
router.register("trips", TripViewSet, basename="trip")
router.register("stops", TripStopViewSet)
router.register("stop-activities", StopActivityViewSet)
router.register("packing-items", PackingItemViewSet)
router.register("notes", TripNoteViewSet)

urlpatterns = [
    path("auth/signup/", signup_view),
    path("auth/login/", login_view),
    path("auth/logout/", logout_view),
    path("public/trips/<int:trip_id>/", public_trip_view),
]

urlpatterns += router.urls
