from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_userprofile"),
    ]

    operations = [
        migrations.AddField(
            model_name="trip",
            name="destination",
            field=models.CharField(blank=True, default="", max_length=200),
        ),
        migrations.AddField(
            model_name="trip",
            name="preferences",
            field=models.TextField(blank=True, default=""),
        ),
    ]
