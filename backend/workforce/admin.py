from django.contrib import admin
from .models import Worker, Attendance, Kibarua

@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'role', 'employment_type', 'phone', 'salary', 'hired_date')
    search_fields = ('full_name', 'phone')
    list_filter = ('role', 'employment_type')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('worker', 'date', 'check_in_time', 'check_out_time')
    list_filter = ('date', 'worker')

@admin.register(Kibarua)
class KibaruaAdmin(admin.ModelAdmin):
    list_display = ('date', 'worker', 'worker_name', 'work_description', 'amount_paid')
    list_filter = ('date',)
    search_fields = ('work_description', 'worker_name')