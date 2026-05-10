from rest_framework.routers import DefaultRouter

from .views import (
    ActivityViewSet,
    CityViewSet,
    PackingItemViewSet,
    StopActivityViewSet,
    TripNoteViewSet,
    TripStopViewSet,
    TripViewSet,
)

router = DefaultRouter()
router.register("cities", CityViewSet)
router.register("activities", ActivityViewSet)
router.register("trips", TripViewSet, basename="trip")
router.register("stops", TripStopViewSet)
router.register("stop-activities", StopActivityViewSet)
router.register("packing-items", PackingItemViewSet)
router.register("notes", TripNoteViewSet)

urlpatterns = router.urls
