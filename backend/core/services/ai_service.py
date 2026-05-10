from decimal import Decimal


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

        days = []
        for index in range(1, number_of_days + 1):
            focus = interests[(index - 1) % len(interests)]
            days.append(
                {
                    "day": index,
                    "title": f"{destination} day {index}: {focus.title()}",
                    "estimated_cost": round(float(per_day_budget), 2),
                    "activities": [
                        {
                            "time": "09:00",
                            "name": f"{focus.title()} discovery walk",
                            "category": focus,
                            "estimated_cost": round(float(per_day_budget * Decimal("0.30")), 2),
                        },
                        {
                            "time": "13:00",
                            "name": "Local food and neighborhood break",
                            "category": "food",
                            "estimated_cost": round(float(per_day_budget * Decimal("0.25")), 2),
                        },
                        {
                            "time": "17:00",
                            "name": "Flexible evening plan",
                            "category": "leisure",
                            "estimated_cost": round(float(per_day_budget * Decimal("0.20")), 2),
                        },
                    ],
                }
            )

        return {
            "destination": destination,
            "budget": float(budget),
            "number_of_days": number_of_days,
            "interests": interests,
            "days": days,
            "summary": {
                "estimated_total": round(float(per_day_budget * Decimal(number_of_days)), 2),
                "average_per_day": round(float(per_day_budget), 2),
            },
            "provider": "mock",
        }
