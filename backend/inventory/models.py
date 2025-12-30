from django.db import models
import uuid
from core.models import Farm

class Tool(models.Model):
    class Condition(models.TextChoices):
        NEW = 'NEW', 'New'
        GOOD = 'GOOD', 'Good'
        NEEDS_REPAIR = 'NEEDS_REPAIR', 'Needs Repair'
        BROKEN = 'BROKEN', 'Broken'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='tools')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, help_text="e.g. Waterpump, Slasher, Axe")
    sku = models.CharField(max_length=50, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.GOOD)
    location = models.CharField(max_length=100, blank=True, help_text="e.g. Barn, Field, Store")
    purchase_date = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    photo = models.ImageField(upload_to='tools/', blank=True, null=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Consumable(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='consumables')
    item_name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, blank=True)
    unit = models.CharField(max_length=20, help_text="e.g. kg, liter, pack")
    quantity_on_hand = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.item_name
