from django.db import models
import uuid
from core.models import Farm

class Livestock(models.Model):
    class Species(models.TextChoices):
        CATTLE = 'CATTLE', 'Cattle'
        POULTRY = 'POULTRY', 'Poultry'
        GOAT = 'GOAT', 'Goat'
        SHEEP = 'SHEEP', 'Sheep'
        PIG = 'PIG', 'Pig'
        RABBIT = 'RABBIT', 'Rabbit'
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
        PREGNANT = 'PREGNANT', 'Pregnant'
        QUARANTINE = 'QUARANTINE', 'Quarantine'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='livestock')
    tag_id = models.CharField(max_length=50)
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
    group = models.ForeignKey('AnimalGroup', on_delete=models.SET_NULL, null=True, blank=True, related_name='animals')
    photo = models.ImageField(upload_to='livestock/', blank=True, null=True)
    notes = models.TextField(blank=True)
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['farm', 'tag_id']

    def __str__(self):
        return f"{self.tag_id} - {self.name or 'Unnamed'}"


class AnimalGroup(models.Model):
    """Groups/pens for organizing animals."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='animal_groups')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True, help_text="Pen, paddock, or section name")
    capacity = models.PositiveIntegerField(null=True, blank=True)
    photo = models.ImageField(upload_to='livestock/groups/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AnimalHealthRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='health_records')
    date = models.DateField()
    vet_name = models.CharField(max_length=100, blank=True)
    condition_notes = models.TextField(blank=True)
    treatment = models.TextField(blank=True)
    medication = models.CharField(max_length=255, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    next_vaccination_date = models.DateField(null=True, blank=True)
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Weight at time of record")
    photo = models.ImageField(upload_to='livestock/health/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Health Record for {self.livestock.tag_id} on {self.date}"


class BreedingRecord(models.Model):
    """Track breeding/mating events and offspring."""

    STATUS_CHOICES = [
        ('PLANNED', 'Planned'),
        ('MATED', 'Mated'),
        ('CONFIRMED_PREGNANT', 'Confirmed Pregnant'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='breeding_records')
    dam = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='breeding_as_dam')
    sire = models.ForeignKey(Livestock, on_delete=models.SET_NULL, null=True, blank=True, related_name='breeding_as_sire')
    sire_external = models.CharField(max_length=100, blank=True, help_text="External sire info if not in system")
    mating_date = models.DateField()
    expected_due_date = models.DateField(null=True, blank=True)
    actual_delivery_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    offspring_count = models.PositiveIntegerField(default=0)
    offspring_details = models.TextField(blank=True)
    method = models.CharField(max_length=50, blank=True, help_text="Natural, AI, etc.")
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Breeding: {self.dam.tag_id} x {self.sire.tag_id if self.sire else self.sire_external}"

    class Meta:
        ordering = ['-mating_date']


class VaccinationSchedule(models.Model):
    """Vaccination tracking and scheduling."""

    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('OVERDUE', 'Overdue'),
        ('SKIPPED', 'Skipped'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='vaccination_schedules')
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, null=True, blank=True, related_name='vaccinations')
    group = models.ForeignKey(AnimalGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name='vaccinations')
    vaccine_name = models.CharField(max_length=100)
    disease = models.CharField(max_length=100, blank=True)
    scheduled_date = models.DateField()
    administered_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='SCHEDULED')
    dosage = models.CharField(max_length=50, blank=True)
    vet_name = models.CharField(max_length=100, blank=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    next_booster_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vaccine_name} - {self.scheduled_date}"

    class Meta:
        ordering = ['scheduled_date']


class MortalityRecord(models.Model):
    """Record animal deaths with cause."""

    CAUSE_CHOICES = [
        ('DISEASE', 'Disease'),
        ('ACCIDENT', 'Accident'),
        ('OLD_AGE', 'Old Age'),
        ('PREDATOR', 'Predator Attack'),
        ('BIRTH_COMPLICATION', 'Birth Complication'),
        ('POISONING', 'Poisoning'),
        ('UNKNOWN', 'Unknown'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='mortality_records')
    date = models.DateField()
    cause = models.CharField(max_length=20, choices=CAUSE_CHOICES, default='UNKNOWN')
    description = models.TextField(blank=True)
    vet_report = models.TextField(blank=True)
    financial_loss = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    photo = models.ImageField(upload_to='livestock/mortality/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Mortality: {self.livestock.tag_id} - {self.get_cause_display()}"


class FeedingProgram(models.Model):
    """Track feeding schedules and consumption."""

    FEED_TYPE_CHOICES = [
        ('HAY', 'Hay'),
        ('SILAGE', 'Silage'),
        ('CONCENTRATES', 'Concentrates'),
        ('DAIRY_MEAL', 'Dairy Meal'),
        ('MINERALS', 'Minerals'),
        ('NAPIER', 'Napier Grass'),
        ('MAIZE_STALKS', 'Maize Stalks'),
        ('LAYERS_MASH', 'Layers Mash'),
        ('CHICK_MASH', 'Chick Mash'),
        ('GROWERS_MASH', 'Growers Mash'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='feeding_programs')
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, null=True, blank=True, related_name='feedings')
    group = models.ForeignKey(AnimalGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name='feedings')
    date = models.DateField()
    feed_type = models.CharField(max_length=20, choices=FEED_TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=8, decimal_places=2)
    unit = models.CharField(max_length=20, default='kg')
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_feed_type_display()} - {self.quantity}{self.unit} on {self.date}"

    class Meta:
        ordering = ['-date']
