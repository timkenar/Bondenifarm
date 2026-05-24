from django.db import models
import uuid
from core.models import Farm


class Warehouse(models.Model):
    """Storage locations on the farm."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='warehouses')
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255, blank=True)
    capacity = models.CharField(max_length=100, blank=True, help_text="e.g. 500 sq ft, 10 tonnes")
    photo = models.ImageField(upload_to='inventory/warehouses/', null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Supplier(models.Model):
    """Supplier directory for the farm."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='suppliers')
    name = models.CharField(max_length=255)
    contact_person = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    supplies = models.TextField(blank=True, help_text="What items they supply")
    rating = models.PositiveIntegerField(null=True, blank=True, help_text="1-5 rating")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Tool(models.Model):
    class Condition(models.TextChoices):
        NEW = 'NEW', 'New'
        GOOD = 'GOOD', 'Good'
        NEEDS_REPAIR = 'NEEDS_REPAIR', 'Needs Repair'
        BROKEN = 'BROKEN', 'Broken'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='tools')
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='tools')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='tools_supplied')
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
    warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='consumables')
    supplier = models.ForeignKey(Supplier, on_delete=models.SET_NULL, null=True, blank=True, related_name='consumables_supplied')
    item_name = models.CharField(max_length=100)
    sku = models.CharField(max_length=50, blank=True)
    unit = models.CharField(max_length=20, help_text="e.g. kg, liter, pack")
    quantity_on_hand = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reorder_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    photo = models.ImageField(upload_to='inventory/consumables/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.item_name


class StockMovement(models.Model):
    """Track stock in/out for consumables and tools."""

    MOVEMENT_CHOICES = [
        ('IN', 'Stock In'),
        ('OUT', 'Stock Out'),
        ('TRANSFER', 'Transfer'),
        ('ADJUSTMENT', 'Adjustment'),
        ('RETURN', 'Return'),
    ]

    REASON_CHOICES = [
        ('PURCHASE', 'Purchase'),
        ('USAGE', 'Usage'),
        ('DAMAGE', 'Damage/Loss'),
        ('EXPIRED', 'Expired'),
        ('DONATION', 'Donation'),
        ('TRANSFER', 'Transfer'),
        ('CORRECTION', 'Correction'),
        ('OTHER', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='stock_movements')
    consumable = models.ForeignKey(Consumable, on_delete=models.CASCADE, null=True, blank=True, related_name='movements')
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE, null=True, blank=True, related_name='movements')
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_CHOICES)
    reason = models.CharField(max_length=15, choices=REASON_CHOICES, default='USAGE')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    from_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='outgoing_movements')
    to_warehouse = models.ForeignKey(Warehouse, on_delete=models.SET_NULL, null=True, blank=True, related_name='incoming_movements')
    reference = models.CharField(max_length=100, blank=True, help_text="Invoice/receipt number")
    notes = models.TextField(blank=True)
    recorded_by = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        item = self.consumable or self.tool
        return f"{self.get_movement_type_display()}: {item} ({self.quantity})"
