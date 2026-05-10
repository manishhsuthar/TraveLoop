import django_filters

from .models import Activity, City, Trip


class CityFilter(django_filters.FilterSet):
    country = django_filters.CharFilter(field_name="country", lookup_expr="iexact")
    region = django_filters.CharFilter(field_name="region", lookup_expr="iexact")

    class Meta:
        model = City
        fields = ["country", "region"]


class ActivityFilter(django_filters.FilterSet):
    activity_type = django_filters.CharFilter(field_name="activity_type", lookup_expr="iexact")
    estimated_cost = django_filters.NumberFilter(field_name="estimated_cost")
    min_cost = django_filters.NumberFilter(field_name="estimated_cost", lookup_expr="gte")
    max_cost = django_filters.NumberFilter(field_name="estimated_cost", lookup_expr="lte")
    city = django_filters.NumberFilter(field_name="city_id")

    class Meta:
        model = Activity
        fields = ["activity_type", "city", "estimated_cost", "min_cost", "max_cost"]


class TripFilter(django_filters.FilterSet):
    visibility = django_filters.CharFilter(field_name="visibility", lookup_expr="iexact")

    class Meta:
        model = Trip
        fields = ["visibility"]
