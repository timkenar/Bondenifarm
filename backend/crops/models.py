from django.db import models
import uuid
from core.models import Farm, FarmPlot


class CropSeason(models.Model):
    """A crop growing season on a specific plot."""

    STATUS_CHOICES = [
        ('PLANNING', 'Planning'),
        ('PLANTED', 'Planted'),
        ('GROWING', 'Growing'),
        ('FLOWERING', 'Flowering'),
        ('HARVESTING', 'Harvesting'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    CROP_CHOICES = [
        ('MAIZE', 'Maize'),
        ('BEANS', 'Beans'),
        ('WHEAT', 'Wheat'),
        ('RICE', 'Rice'),
        ('POTATOES', 'Potatoes'),
        ('TOMATOES', 'Tomatoes'),
        ('CABBAGE', 'Cabbage'),
        ('KALE', 'Kale'),
        ('ONIONS', 'Onions'),
        ('CARROTS', 'Carrots'),
        ('TEA', 'Tea'),
        ('COFFEE', 'Coffee'),
        ('SUGARCANE', 'Sugarcane'),
        ('NAPIER', 'Napier Grass'),
        ('SUNFLOWER', 'Sunflower'),
        ('SORGHUM', 'Sorghum'),
        ('MILLET', 'Millet'),
        ('BANANAS', 'Bananas'),
        ('AVOCADO', 'Avocado'),
        ('MACADAMIA', 'Macadamia'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='crop_seasons')
    plot = models.ForeignKey(FarmPlot, on_delete=models.CASCADE, related_name='crop_seasons')
    crop_type = models.CharField(max_length=30, choices=CROP_CHOICES)
    variety = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNING')

    # Dates
    planting_date = models.DateField(null=True, blank=True)
    expected_harvest_date = models.DateField(null=True, blank=True)
    actual_harvest_date = models.DateField(null=True, blank=True)

    # Quantities
    seed_quantity = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    seed_unit = models.CharField(max_length=20, blank=True)
    expected_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    yield_unit = models.CharField(max_length=20, default='kg')

    # Cost
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Media
    photo = models.ImageField(upload_to='crops/seasons/', null=True, blank=True)
    notes = models.TextField(blank=True)
    custom_data = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_crop_type_display()} - {self.plot.name} ({self.status})"

    class Meta:
        ordering = ['-planting_date']


class CropActivity(models.Model):
    """Activities performed on a crop (planting, weeding, spraying, etc.)."""

    ACTIVITY_CHOICES = [
        ('PLOUGHING', 'Ploughing'),
        ('PLANTING', 'Planting'),
        ('WEEDING', 'Weeding'),
        ('FERTILIZING', 'Fertilizing'),
        ('SPRAYING', 'Spraying'),
        ('IRRIGATING', 'Irrigating'),
        ('PRUNING', 'Pruning'),
        ('THINNING', 'Thinning'),
        ('MULCHING', 'Mulching'),
        ('HARVESTING', 'Harvesting'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    season = models.ForeignKey(CropSeason, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_CHOICES)
    date = models.DateField()
    description = models.TextField(blank=True)

    # Resources used
    inputs_used = models.CharField(max_length=255, blank=True, help_text="e.g. DAP 50kg, CAN 25kg")
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    labor_hours = models.DecimalField(max_digits=6, decimal_places=1, default=0)
    workers_count = models.PositiveIntegerField(default=1)

    photo = models.ImageField(upload_to='crops/activities/', null=True, blank=True)
    custom_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_activity_type_display()} on {self.date}"

    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Crop activities'


class PestDisease(models.Model):
    """Pest or disease occurrence on a crop."""

    SEVERITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('SEVERE', 'Severe'),
    ]

    TYPE_CHOICES = [
        ('PEST', 'Pest'),
        ('DISEASE', 'Disease'),
        ('WEED', 'Weed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    season = models.ForeignKey(CropSeason, on_delete=models.CASCADE, related_name='pest_diseases')
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    name = models.CharField(max_length=100)
    date_detected = models.DateField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default='LOW')
    affected_area_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    treatment = models.TextField(blank=True)
    treatment_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    resolved = models.BooleanField(default=False)
    resolution_date = models.DateField(null=True, blank=True)
    photo = models.ImageField(upload_to='crops/pests/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_severity_display()})"

    class Meta:
        ordering = ['-date_detected']
        verbose_name_plural = 'Pests & diseases'


class HarvestRecord(models.Model):
    """Individual harvest entries for a crop season."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    season = models.ForeignKey(CropSeason, on_delete=models.CASCADE, related_name='harvests')
    date = models.DateField()
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')
    quality_grade = models.CharField(max_length=20, blank=True)
    storage_location = models.CharField(max_length=100, blank=True)
    workers_count = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to='crops/harvests/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Harvest: {self.quantity} {self.unit} on {self.date}"

    class Meta:
        ordering = ['-date']
