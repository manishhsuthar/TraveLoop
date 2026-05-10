from django.conf import settings
from django.db import models


class City(models.Model):
    name = models.CharField(max_length=120)
    country = models.CharField(max_length=120)
    region = models.CharField(max_length=120, blank=True)
    cost_index = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    popularity_score = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("name", "country")
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}, {self.country}"


class Activity(models.Model):
    ACTIVITY_TYPES = [
        ("sightseeing", "Sightseeing"),
        ("food", "Food"),
        ("adventure", "Adventure"),
        ("culture", "Culture"),
        ("nightlife", "Nightlife"),
    ]

    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="activities")
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPES)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=1)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Trip(models.Model):
    VISIBILITY_CHOICES = [
        ("private", "Private"),
        ("public", "Public"),
        ("shared", "Shared"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trips")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    budget_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default="private")
    cover_photo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1

    def __str__(self):
        return self.name


class TripStop(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="stops")
    city = models.ForeignKey(City, on_delete=models.PROTECT, related_name="trip_stops")
    start_date = models.DateField()
    end_date = models.DateField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "start_date"]

    @property
    def duration_days(self):
        return (self.end_date - self.start_date).days + 1


class StopActivity(models.Model):
    trip_stop = models.ForeignKey(TripStop, on_delete=models.CASCADE, related_name="stop_activities")
    activity = models.ForeignKey(Activity, on_delete=models.PROTECT, related_name="planned_instances")
    day_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    estimated_cost_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)


class PackingItem(models.Model):
    CATEGORY_CHOICES = [
        ("clothing", "Clothing"),
        ("documents", "Documents"),
        ("electronics", "Electronics"),
        ("other", "Other"),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="packing_items")
    title = models.CharField(max_length=120)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default="other")
    is_packed = models.BooleanField(default=False)

    class Meta:
        ordering = ["is_packed", "title"]


class TripNote(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="notes")
    trip_stop = models.ForeignKey(TripStop, on_delete=models.SET_NULL, null=True, blank=True, related_name="notes")
    title = models.CharField(max_length=120)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class UserProfile(models.Model):
    """Extended user profile for travel-specific info."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    phone = models.CharField(max_length=15, blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    preferences = models.TextField(blank=True)
    language = models.CharField(max_length=50, blank=True, default="")
    avatar_url = models.TextField(blank=True, default="")

    def __str__(self):
        return f"Profile: {self.user.username}"


class SavedCity(models.Model):
    """Bookmarked / saved cities per user."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_cities",
    )
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name="saved_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "city")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} → {self.city.name}"
