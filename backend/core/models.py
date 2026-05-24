from django.db import models
import uuid


class Farm(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    address = models.TextField(blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    currency = models.CharField(max_length=10, default='KES')

    # GPS & Acreage
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    total_acreage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    boundary_polygon = models.JSONField(
        null=True, blank=True,
        help_text="GeoJSON polygon coordinates for farm boundary"
    )

    # Branding & Media
    photo = models.ImageField(upload_to='farms/photos/', null=True, blank=True)
    logo = models.ImageField(upload_to='farms/logos/', null=True, blank=True)
    description = models.TextField(blank=True)

    # Contact
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class FarmPlot(models.Model):
    """Individual land parcels/fields within the farm."""

    SOIL_TYPE_CHOICES = [
        ('CLAY', 'Clay'),
        ('SANDY', 'Sandy'),
        ('LOAM', 'Loam'),
        ('SILT', 'Silt'),
        ('PEAT', 'Peat'),
        ('CHALK', 'Chalk'),
        ('RED', 'Red Soil'),
        ('BLACK_COTTON', 'Black Cotton'),
        ('OTHER', 'Other'),
    ]

    STATUS_CHOICES = [
        ('ACTIVE', 'Active / In Use'),
        ('FALLOW', 'Fallow'),
        ('PREPARING', 'Being Prepared'),
        ('HARVESTED', 'Harvested'),
        ('IDLE', 'Idle'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='plots')
    name = models.CharField(max_length=255)
    size_acres = models.DecimalField(max_digits=8, decimal_places=2)

    # GPS
    latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    boundary_polygon = models.JSONField(
        null=True, blank=True,
        help_text="GeoJSON polygon coordinates for plot boundary"
    )

    # Characteristics
    soil_type = models.CharField(max_length=20, choices=SOIL_TYPE_CHOICES, default='LOAM')
    irrigation_type = models.CharField(max_length=50, blank=True)
    current_crop = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IDLE')

    # Media
    photo = models.ImageField(upload_to='plots/photos/', null=True, blank=True)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.size_acres} acres)"

    class Meta:
        ordering = ['name']
