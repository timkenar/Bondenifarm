from django.db import models
from django.conf import settings
import uuid
from core.models import Farm

class Sale(models.Model):
    class Product(models.TextChoices):
        EGGS = 'EGGS', 'Eggs'
        MILK = 'MILK', 'Milk'
        TOMATOES = 'TOMATOES', 'Tomatoes'
        MANURE = 'MANURE', 'Manure'
        OTHER = 'OTHER', 'Other'

    class PaymentStatus(models.TextChoices):
        PAID = 'PAID', 'Paid'
        PARTIAL = 'PARTIAL', 'Partial'
        PENDING = 'PENDING', 'Pending'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='sales')
    date = models.DateField()
    product = models.CharField(max_length=50, choices=Product.choices)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20, help_text="e.g. cartons, liters, crates")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    customer_name = models.CharField(max_length=255, blank=True)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PAID)
    invoice_number = models.CharField(max_length=50, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='recorded_sales')
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    livestock = models.ForeignKey('livestock.Livestock', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    consumable = models.ForeignKey('inventory.Consumable', on_delete=models.SET_NULL, null=True, blank=True, related_name='sales')
    # produce_record link if needed, or just product type

    def save(self, *args, **kwargs):
        if not self.total_amount and self.quantity and self.unit_price:
            self.total_amount = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product} - {self.date}"

class Purchase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='purchases')
    date = models.DateField()
    supplier = models.CharField(max_length=255)
    items = models.JSONField(help_text="Line items of purchase", default=dict)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Purchase from {self.supplier} on {self.date}"

class Expenditure(models.Model):
    class Category(models.TextChoices):
        FEED = 'FEED', 'Feed'
        LABOR = 'LABOR', 'Labor'
        FUEL = 'FUEL', 'Fuel'
        MAINTENANCE = 'MAINTENANCE', 'Maintenance'
        TREATMENT = 'TREATMENT', 'Treatment'
        OTHER = 'OTHER', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='expenditures')
    date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=50, choices=Category.choices)
    description = models.TextField(blank=True)
    
    # Financial linking
    related_livestock = models.ForeignKey('livestock.Livestock', on_delete=models.SET_NULL, null=True, blank=True, related_name='expenditures')
    # related_produce could be added if we want to track cost of specific produce batch, but livestock category is usually enough (e.g. Poultry Feed)
    
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.category} - {self.amount} on {self.date}"
