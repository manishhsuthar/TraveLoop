from datetime import date, time

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Activity, City, PackingItem, StopActivity, Trip, TripNote, TripStop, UserProfile


INDIAN_CITIES = [
    ("Goa", "West India", 5200, 98),
    ("Pondicherry", "South India", 4200, 82),
    ("Andaman", "Islands", 7800, 91),
    ("Gokarna", "South India", 3600, 76),
    ("Kovalam", "South India", 4500, 79),
    ("Manali", "North India", 4300, 95),
    ("Shimla", "North India", 4100, 90),
    ("Leh Ladakh", "North India", 7200, 96),
    ("Mussoorie", "North India", 3800, 86),
    ("Nainital", "North India", 3900, 84),
    ("Darjeeling", "East India", 4200, 88),
    ("Mumbai", "West India", 6500, 94),
    ("Delhi", "North India", 5600, 96),
    ("Bengaluru", "South India", 5200, 86),
    ("Ahmedabad", "West India", 3900, 78),
    ("Jaipur", "North India", 4500, 97),
    ("Hyderabad", "South India", 4300, 85),
    ("Chennai", "South India", 4300, 82),
    ("Kolkata", "East India", 4000, 84),
    ("Pune", "West India", 4600, 78),
    ("Udaipur", "North India", 5200, 94),
    ("Jaisalmer", "North India", 5000, 91),
    ("Varanasi", "North India", 3500, 93),
    ("Hampi", "South India", 3200, 89),
    ("Khajuraho", "Central India", 3100, 75),
    ("Amritsar", "North India", 3300, 90),
    ("Jim Corbett", "North India", 6200, 87),
    ("Kaziranga", "Northeast India", 6400, 88),
    ("Rann of Kutch", "West India", 4700, 86),
    ("Munnar", "South India", 4400, 92),
    ("Coorg", "South India", 4600, 90),
    ("Kedarnath", "North India", 5200, 95),
    ("Badrinath", "North India", 5000, 88),
    ("Tirupati", "South India", 3300, 91),
    ("Somnath", "West India", 3100, 84),
    ("Dwarka", "West India", 3200, 83),
    ("Ayodhya", "North India", 3000, 89),
]

ACTIVITY_TEMPLATES = {
    "Goa": [
        ("Baga Beach Sunset", "sightseeing", 800, 2, "Beach sunset, local snacks, and coastal photo stops."),
        ("Old Goa Heritage Walk", "culture", 1200, 3, "Churches, Portuguese lanes, and local history."),
        ("Goan Seafood Trail", "food", 1800, 2, "Local seafood, bebinca, and cafe hopping."),
    ],
    "Manali": [
        ("Solang Valley Adventure", "adventure", 2500, 4, "Cable car, snow activities when available, and valley views."),
        ("Old Manali Cafe Walk", "food", 1200, 2, "Local cafes, bakeries, and mountain views."),
    ],
    "Leh Ladakh": [
        ("Thiksey Monastery Visit", "culture", 1500, 3, "Monastery visit with high-altitude viewpoints."),
        ("Pangong Day Excursion", "adventure", 5500, 8, "Shared vehicle excursion with permits and local stops."),
    ],
    "Jaipur": [
        ("Amber Fort Guided Visit", "culture", 1800, 3, "Fort history, viewpoints, and local guide."),
        ("Johari Bazaar Food Walk", "food", 1000, 2, "Kachori, lassi, sweets, and market lanes."),
    ],
    "Udaipur": [
        ("Lake Pichola Boat Ride", "sightseeing", 1600, 2, "Boat ride with palace and ghats views."),
        ("City Palace Museum", "culture", 1400, 3, "Museum visit and old city walk."),
    ],
    "Varanasi": [
        ("Ganga Aarti Experience", "culture", 700, 2, "Evening aarti with ghat walk."),
        ("Banarasi Breakfast Trail", "food", 600, 2, "Kachori sabzi, malaiyyo, and chai stops."),
    ],
    "Munnar": [
        ("Tea Estate Walk", "sightseeing", 1200, 3, "Tea garden walk and viewpoint visit."),
        ("Spice Plantation Visit", "culture", 1000, 2, "Cardamom, pepper, and local produce experience."),
    ],
    "Jim Corbett": [
        ("Jeep Safari Buffer Zone", "adventure", 4500, 4, "Wildlife safari with forest guide."),
        ("Kosi River Nature Walk", "sightseeing", 900, 2, "River trail and birdwatching."),
    ],
    "Mumbai": [
        ("South Mumbai Heritage Walk", "culture", 900, 3, "Fort area, Kala Ghoda, and colonial architecture."),
        ("Mumbai Street Food Crawl", "food", 900, 2, "Vada pav, pav bhaji, kulfi, and local favourites."),
    ],
    "Delhi": [
        ("Old Delhi Food Walk", "food", 1200, 3, "Paratha, chaat, kebabs, and market lanes."),
        ("Qutub Minar and Humayun Tomb", "culture", 1500, 4, "Mughal and Sultanate-era heritage circuit."),
    ],
}

DEFAULT_ACTIVITIES = [
    ("Local Sightseeing Circuit", "sightseeing", 900, 3, "Top local viewpoints, markets, and landmark stops."),
    ("Regional Food Experience", "food", 800, 2, "Local snacks, sweets, and everyday favourites."),
]


class Command(BaseCommand):
    help = "Seed India-focused demo data for Traveloop"

    def handle(self, *args, **options):
        user = self._seed_user()
        cities = self._seed_cities()
        activities = self._seed_activities(cities)
        self._seed_trips(user, cities, activities)
        self.stdout.write(self.style.SUCCESS("India-focused Traveloop demo data seeded successfully."))

    def _seed_user(self):
        user_model = get_user_model()
        user, _ = user_model.objects.get_or_create(
            username="demo",
            defaults={"email": "demo@traveloop.local"},
        )
        user.set_password("demo12345")
        user.save(update_fields=["password"])

        UserProfile.objects.update_or_create(
            user=user,
            defaults={
                "phone": "9876543210",
                "city": "Ahmedabad",
                "country": "India",
                "preferences": "beaches, heritage, food, mountain road trips, weekend getaways",
            },
        )
        return user

    def _seed_cities(self):
        cities = {}
        for name, region, cost_index, popularity_score in INDIAN_CITIES:
            city, _ = City.objects.update_or_create(
                name=name,
                country="India",
                defaults={
                    "region": region,
                    "cost_index": cost_index,
                    "popularity_score": popularity_score,
                },
            )
            cities[name] = city
        return cities

    def _seed_activities(self, cities):
        activities = {}
        for city_name, city in cities.items():
            templates = ACTIVITY_TEMPLATES.get(city_name, DEFAULT_ACTIVITIES)
            activities[city_name] = []
            for name, activity_type, cost, duration, description in templates:
                activity, _ = Activity.objects.update_or_create(
                    city=city,
                    name=name,
                    defaults={
                        "description": description,
                        "activity_type": activity_type,
                        "estimated_cost": cost,
                        "duration_hours": duration,
                    },
                )
                activities[city_name].append(activity)
        return activities

    def _seed_trips(self, user, cities, activities):
        rajasthan_trip = self._upsert_trip(
            user=user,
            name="Rajasthan Heritage Circuit",
            description="Jaipur, Udaipur, and Jaisalmer with forts, lakes, food, and desert culture.",
            start_date=date(2026, 6, 12),
            end_date=date(2026, 6, 18),
            budget_limit=52000,
            visibility="public",
        )
        self._seed_trip_details(
            rajasthan_trip,
            [
                ("Jaipur", date(2026, 6, 12), date(2026, 6, 14)),
                ("Udaipur", date(2026, 6, 15), date(2026, 6, 16)),
                ("Jaisalmer", date(2026, 6, 17), date(2026, 6, 18)),
            ],
            activities,
            notes=[
                ("Train planning", "Book Jaipur to Udaipur train or overnight bus early."),
                ("Food list", "Try dal baati churma, pyaaz kachori, ghewar, and ker sangri."),
            ],
        )

        goa_trip = self._upsert_trip(
            user=user,
            name="Goa Beach Workation",
            description="A relaxed Goa plan with beach time, food, and Old Goa culture.",
            start_date=date(2026, 7, 3),
            end_date=date(2026, 7, 7),
            budget_limit=28000,
            visibility="public",
        )
        self._seed_trip_details(
            goa_trip,
            [("Goa", date(2026, 7, 3), date(2026, 7, 7))],
            activities,
            notes=[
                ("Scooter rental", "Carry driving licence and compare rental rates locally."),
                ("Monsoon note", "Keep flexible beach plans if rain is heavy."),
            ],
        )

        himachal_trip = self._upsert_trip(
            user=user,
            name="Himachal Mountain Roadtrip",
            description="Shimla and Manali route for mountain cafes, valleys, and adventure activities.",
            start_date=date(2026, 8, 10),
            end_date=date(2026, 8, 16),
            budget_limit=42000,
            visibility="private",
        )
        self._seed_trip_details(
            himachal_trip,
            [
                ("Shimla", date(2026, 8, 10), date(2026, 8, 12)),
                ("Manali", date(2026, 8, 13), date(2026, 8, 16)),
            ],
            activities,
            notes=[
                ("Road buffer", "Keep buffer time for landslide or traffic delays."),
                ("Packing", "Carry light jacket, rain cover, and motion sickness tablets."),
            ],
        )

    def _upsert_trip(self, *, user, name, description, start_date, end_date, budget_limit, visibility):
        trip, _ = Trip.objects.update_or_create(
            user=user,
            name=name,
            defaults={
                "description": description,
                "start_date": start_date,
                "end_date": end_date,
                "budget_limit": budget_limit,
                "visibility": visibility,
            },
        )
        return trip

    def _seed_trip_details(self, trip, stop_specs, activities, notes):
        stop_by_city = {}
        for order, (city_name, start_date, end_date) in enumerate(stop_specs, start=1):
            stop, _ = TripStop.objects.update_or_create(
                trip=trip,
                city=City.objects.get(name=city_name, country="India"),
                defaults={"start_date": start_date, "end_date": end_date, "order": order},
            )
            stop_by_city[city_name] = stop

            for index, activity in enumerate(activities.get(city_name, [])[:2]):
                StopActivity.objects.update_or_create(
                    trip_stop=stop,
                    activity=activity,
                    defaults={
                        "day_date": start_date,
                        "start_time": time(hour=9 + (index * 4)),
                        "estimated_cost_override": None,
                    },
                )

        for title, category in [
            ("Aadhaar / ID proof", "documents"),
            ("UPI-enabled payment app", "other"),
            ("Power bank", "electronics"),
            ("Comfortable walking shoes", "clothing"),
            ("Reusable water bottle", "other"),
        ]:
            PackingItem.objects.update_or_create(
                trip=trip,
                title=title,
                defaults={"category": category, "is_packed": False},
            )

        first_stop = next(iter(stop_by_city.values()), None)
        for title, content in notes:
            TripNote.objects.update_or_create(
                trip=trip,
                title=title,
                defaults={"content": content, "trip_stop": first_stop},
            )
