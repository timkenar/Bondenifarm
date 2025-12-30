from django.db import models
import uuid
from core.models import Farm

class Worker(models.Model):
    class EmploymentType(models.TextChoices):
        PERMANENT = 'PERMANENT', 'Permanent'
        CONTRACT = 'CONTRACT', 'Contract'
        CASUAL = 'CASUAL', 'Casual'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='workers')
    full_name = models.CharField(max_length=255)
    national_id = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.PERMANENT)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    hired_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name

class Attendance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='attendance_records')
    date = models.DateField()
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    task_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', 'worker']

    def __str__(self):
        return f"{self.worker.full_name} - {self.date}"

class Kibarua(models.Model):
    """Casual/daily labor payment record"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='kibarua_records')
    worker = models.ForeignKey(Worker, on_delete=models.SET_NULL, null=True, blank=True, related_name='kibarua_records')
    worker_name = models.CharField(max_length=255, blank=True, help_text="For unregistered casual workers")
    date = models.DateField()
    work_description = models.TextField()
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
    custom_data = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        name = self.worker.full_name if self.worker else self.worker_name
        return f"Kibarua: {name} - {self.date}"
