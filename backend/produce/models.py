from django.db import models
import uuid
from core.models import Farm
from livestock.models import Livestock

class ProduceRecord(models.Model):
    class ProduceType(models.TextChoices):
        MILK = 'MILK', 'Milk'
        EGGS = 'EGGS', 'Eggs'
        MAIZE = 'MAIZE', 'Maize'
        OTHER = 'OTHER', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='produce_records')
    date = models.DateField()
    produce_type = models.CharField(max_length=20, choices=ProduceType.choices)
    
    # Generic quantity (e.g., bags of maize)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Total quantity (e.g. liters, count, bags)")
    unit = models.CharField(max_length=20, default='units')

    # Specific fields for Milk
    morning_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Morning milk in liters")
    noon_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Noon milk in liters")
    evening_yield = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Evening milk in liters")

    # Specific fields for Eggs
    crates = models.DecimalField(max_digits=10, decimal_places=1, null=True, blank=True, help_text="Calculated crates (1 crate = 30 eggs)")
    
    # Optional link to specific livestock (e.g., if tracking yield per cow)
    livestock = models.ForeignKey(Livestock, on_delete=models.SET_NULL, null=True, blank=True, related_name='produce_records')
    
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Auto-calculate Milk Total
        if self.produce_type == self.ProduceType.MILK:
            morning = self.morning_yield or 0
            noon = self.noon_yield or 0
            evening = self.evening_yield or 0
            self.quantity = morning + noon + evening
            self.unit = 'liters'

        # Auto-calculate Egg Crates
        if self.produce_type == self.ProduceType.EGGS and self.quantity:
            self.crates = self.quantity / 30
            self.unit = 'eggs'
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_produce_type_display()} - {self.date} ({self.quantity} {self.unit})"
