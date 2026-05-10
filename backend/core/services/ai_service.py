from decimal import Decimal

from core.utils import CURRENCY_CODE, format_inr


INDIAN_DESTINATION_STYLES = {
    "goa": ("Goa", ["Beach shack breakfast", "Old Goa heritage walk", "Sunset at Anjuna"]),
    "rajasthan": ("Rajasthan", ["City palace visit", "Local thali lunch", "Folk music evening"]),
    "jaipur": ("Jaipur", ["Amber Fort", "Johari Bazaar walk", "Rajasthani dinner"]),
    "udaipur": ("Udaipur", ["Lake Pichola", "City Palace", "Rooftop dinner"]),
    "manali": ("Manali", ["Mall Road cafe", "Solang Valley", "Mountain viewpoint"]),
    "himachal": ("Himachal Pradesh", ["Scenic road trip", "Local market", "Valley sunset"]),
    "kerala": ("Kerala", ["Backwater cruise", "Spice plantation", "Sadya meal"]),
    "varanasi": ("Varanasi", ["Ganga ghat walk", "Temple trail", "Evening aarti"]),
    "ladakh": ("Leh Ladakh", ["Monastery visit", "High-altitude viewpoint", "Tibetan cafe"]),
    "mumbai": ("Mumbai", ["Marine Drive", "Heritage precinct walk", "Street food trail"]),
    "delhi": ("Delhi", ["Old Delhi food walk", "Mughal monument visit", "India Gate evening"]),
}


class ItineraryGenerationService:
    """
    Provider-neutral itinerary service.

    Replace generate() internals with a Gemini/OpenAI/etc. adapter when credentials
    are available; keep the response contract stable for the frontend.
    """

    def generate(self, *, destination, budget, number_of_days, interests):
        budget = Decimal(budget)
        per_day_budget = budget / Decimal(number_of_days)
        interests = interests or ["sightseeing"]
        normalized_destination = destination.lower()
        city, default_plan = self._resolve_destination(destination, normalized_destination)

        days = []
        for index in range(1, number_of_days + 1):
            focus = interests[(index - 1) % len(interests)]
            morning, afternoon, evening = self._activities_for_day(default_plan, focus)
            days.append(
                {
                    "day": index,
                    "city": city,
                    "title": f"{city} day {index}: {focus.title()}",
                    "currency": CURRENCY_CODE,
                    "estimated_cost_inr": round(float(per_day_budget), 2),
                    "estimated_cost_formatted": format_inr(per_day_budget),
                    "activities": [
                        {
                            "time": "09:00",
                            "name": morning,
                            "category": focus,
                            "estimated_cost_inr": round(float(per_day_budget * Decimal("0.30")), 2),
                            "estimated_cost_formatted": format_inr(per_day_budget * Decimal("0.30")),
                        },
                        {
                            "time": "13:00",
                            "name": afternoon,
                            "category": "food",
                            "estimated_cost_inr": round(float(per_day_budget * Decimal("0.25")), 2),
                            "estimated_cost_formatted": format_inr(per_day_budget * Decimal("0.25")),
                        },
                        {
                            "time": "17:00",
                            "name": evening,
                            "category": "leisure",
                            "estimated_cost_inr": round(float(per_day_budget * Decimal("0.20")), 2),
                            "estimated_cost_formatted": format_inr(per_day_budget * Decimal("0.20")),
                        },
                    ],
                }
            )

        return {
            "destination": destination,
            "primary_city": city,
            "currency": CURRENCY_CODE,
            "estimated_budget_inr": float(budget),
            "estimated_budget_formatted": format_inr(budget),
            "number_of_days": number_of_days,
            "interests": interests,
            "days": days,
            "summary": {
                "estimated_total_inr": round(float(per_day_budget * Decimal(number_of_days)), 2),
                "estimated_total_formatted": format_inr(per_day_budget * Decimal(number_of_days)),
                "average_per_day_inr": round(float(per_day_budget), 2),
                "average_per_day_formatted": format_inr(per_day_budget),
                "travel_style": self._travel_style(budget, number_of_days),
            },
            "provider": "mock",
        }

    def _resolve_destination(self, destination, normalized_destination):
        for keyword, plan in INDIAN_DESTINATION_STYLES.items():
            if keyword in normalized_destination:
                return plan
        return destination, [
            "Local landmark visit",
            "Regional food experience",
            "Market and sunset walk",
        ]

    def _activities_for_day(self, default_plan, focus):
        if focus.lower() in {"food", "cuisine"}:
            return "Local breakfast trail", "Regional thali or street food crawl", default_plan[2]
        if focus.lower() in {"culture", "heritage"}:
            return default_plan[0], "Museum or heritage walk", "Cultural performance or old city stroll"
        if focus.lower() in {"adventure", "nature"}:
            return "Early scenic viewpoint", "Outdoor activity with local guide", "Relaxed cafe evening"
        return default_plan

    def _travel_style(self, budget, number_of_days):
        per_day = budget / Decimal(number_of_days)
        if per_day < Decimal("2500"):
            return "budget Indian backpacker"
        if per_day < Decimal("7000"):
            return "comfortable mid-range Indian traveller"
        return "premium Indian holiday"
