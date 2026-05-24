from django.db import models
import uuid
from core.models import Farm


class Department(models.Model):
    """Farm departments for organizing workers."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    head = models.ForeignKey('Worker', on_delete=models.SET_NULL, null=True, blank=True, related_name='headed_departments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Worker(models.Model):
    class EmploymentType(models.TextChoices):
        PERMANENT = 'PERMANENT', 'Permanent'
        CONTRACT = 'CONTRACT', 'Contract'
        CASUAL = 'CASUAL', 'Casual'

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        SUSPENDED = 'SUSPENDED', 'Suspended'
        TERMINATED = 'TERMINATED', 'Terminated'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='workers')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='workers')
    full_name = models.CharField(max_length=255)
    national_id = models.CharField(max_length=50, blank=True)
    role = models.CharField(max_length=100)
    employment_type = models.CharField(max_length=20, choices=EmploymentType.choices, default=EmploymentType.PERMANENT)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.ACTIVE)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    hired_date = models.DateField(null=True, blank=True)
    contract_end_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    photo = models.ImageField(upload_to='workforce/photos/', null=True, blank=True)

    # Emergency contact
    next_of_kin_name = models.CharField(max_length=255, blank=True)
    next_of_kin_phone = models.CharField(max_length=20, blank=True)
    next_of_kin_relationship = models.CharField(max_length=50, blank=True)

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
        unique_together = ['worker', 'date']

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


class PayrollRecord(models.Model):
    """Monthly payroll records."""

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('PARTIAL', 'Partially Paid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    farm = models.ForeignKey(Farm, on_delete=models.CASCADE, related_name='payroll_records')
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='payroll_records')
    month = models.DateField(help_text="First day of the pay month")
    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    overtime = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonuses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_pay = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    payment_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-month']
        unique_together = ['worker', 'month']

    def __str__(self):
        return f"Payroll: {self.worker.full_name} - {self.month.strftime('%B %Y')}"


class LeaveRequest(models.Model):
    """Employee leave management."""

    LEAVE_TYPE_CHOICES = [
        ('ANNUAL', 'Annual Leave'),
        ('SICK', 'Sick Leave'),
        ('MATERNITY', 'Maternity Leave'),
        ('PATERNITY', 'Paternity Leave'),
        ('COMPASSIONATE', 'Compassionate Leave'),
        ('UNPAID', 'Unpaid Leave'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('CANCELLED', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    worker = models.ForeignKey(Worker, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.CharField(max_length=15, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    approved_by = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.worker.full_name} - {self.get_leave_type_display()} ({self.start_date} to {self.end_date})"
