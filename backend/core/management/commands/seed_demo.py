from datetime import date

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Activity, City, Trip, TripStop, UserProfile


class Command(BaseCommand):
    help = "Seed demo data for Traveloop"

    def handle(self, *args, **options):
        user_model = get_user_model()
        user, _ = user_model.objects.get_or_create(
            username="demo",
            defaults={"email": "demo@traveloop.local"},
        )
        if not user.has_usable_password():
            user.set_password("demo12345")
            user.save()

        # Ensure profile exists for demo user
        UserProfile.objects.get_or_create(
            user=user,
            defaults={
                "phone": "",
                "city": "Paris",
                "country": "France",
                "preferences": "culture, food",
            },
        )

        paris, _ = City.objects.get_or_create(
            name="Paris",
            country="France",
            defaults={"region": "Europe", "cost_index": 84, "popularity_score": 95},
        )
        tokyo, _ = City.objects.get_or_create(
            name="Tokyo",
            country="Japan",
            defaults={"region": "Asia", "cost_index": 88, "popularity_score": 98},
        )

        Activity.objects.get_or_create(
            city=paris,
            name="Louvre Museum Visit",
            defaults={
                "description": "Guided museum tour",
                "activity_type": "culture",
                "estimated_cost": 35,
                "duration_hours": 3,
            },
        )
        Activity.objects.get_or_create(
            city=tokyo,
            name="Shibuya Food Walk",
            defaults={
                "description": "Street food and local spots",
                "activity_type": "food",
                "estimated_cost": 45,
                "duration_hours": 2.5,
            },
        )

        trip, _ = Trip.objects.get_or_create(
            user=user,
            name="Demo Multi-City Trip",
            defaults={
                "description": "Sample itinerary",
                "start_date": date(2026, 6, 1),
                "end_date": date(2026, 6, 8),
                "budget_limit": 2500,
                "visibility": "public",
            },
        )

        TripStop.objects.get_or_create(
            trip=trip,
            city=paris,
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 4),
            order=1,
        )
        TripStop.objects.get_or_create(
            trip=trip,
            city=tokyo,
            start_date=date(2026, 6, 5),
            end_date=date(2026, 6, 8),
            order=2,
        )

        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully."))
