from django.contrib import admin
from .models import Activity, City, PackingItem, StopActivity, Trip, TripNote, TripStop

admin.site.register(City)
admin.site.register(Activity)
admin.site.register(Trip)
admin.site.register(TripStop)
admin.site.register(StopActivity)
admin.site.register(PackingItem)
admin.site.register(TripNote)
