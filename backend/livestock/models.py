from django.db import models
import uuid
from core.models import Farm

class Livestock(models.Model):
    class Species(models.TextChoices):
        CATTLE = 'CATTLE', 'Cattle'
        POULTRY = 'POULTRY', 'Poultry'
        GOAT = 'GOAT', 'Goat'
        SHEEP = 'SHEEP', 'Sheep'
        OTHER = 'OTHER', 'Other'

    class Sex(models.TextChoices):
        MALE = 'MALE', 'Male'
        FEMALE = 'FEMALE', 'Female'

    class Category(models.TextChoices):
        HEIFER = 'HEIFER', 'Heifer'
        CALF = 'CALF', 'Calf'
        BULL = 'BULL', 'Bull'
        COW = 'COW', 'Cow'
        BUCK = 'BUCK', 'Buck'
        DOE = 'DOE', 'Doe'
        KID = 'KID', 'Kid'
        RAM = 'RAM', 'Ram'
        EWE = 'EWE', 'Ewe'
        LAMB = 'LAMB', 'Lamb'
        LAYER = 'LAYER', 'Layer'
        BROILER = 'BROILER', 'Broiler'
        KIENYEJI = 'KIENYEJI', 'Kienyeji'
        CHICK = 'CHICK', 'Chick'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        SOLD = 'SOLD', 'Sold'
        DECEASED = 'DECEASED', 'Deceased'
        SICK = 'SICK', 'Sick'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='livestock')
    tag_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100, blank=True)
    species = models.CharField(max_length=20, choices=Species.choices, default=Species.CATTLE)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    breed = models.CharField(max_length=100, blank=True)
    sex = models.CharField(max_length=10, choices=Sex.choices)
    quantity = models.PositiveIntegerField(default=1, help_text="Number of animals (useful for poultry)")
    dob = models.DateField(null=True, blank=True)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    current_weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Weight in kg")
    photo = models.ImageField(upload_to='livestock/', blank=True, null=True)
    notes = models.TextField(blank=True)
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.tag_id} - {self.name or 'Unnamed'}"

class AnimalHealthRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='health_records')
    date = models.DateField()
    vet_name = models.CharField(max_length=100, blank=True)
    condition_notes = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    medication = models.CharField(max_length=255, blank=True)
    next_vaccination_date = models.DateField(null=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Weight at time of record")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Health Record for {self.livestock.tag_id} on {self.date}"
