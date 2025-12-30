from django.contrib import admin
from .models import ProduceRecord

@admin.register(ProduceRecord)
class ProduceRecordAdmin(admin.ModelAdmin):
    list_display = ('date', 'produce_type', 'quantity', 'unit', 'crates', 'created_at')
    list_filter = ('produce_type', 'date', 'farm')
    search_fields = ('produce_type',)
    ordering = ('-date',)
