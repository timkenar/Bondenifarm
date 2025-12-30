from django.contrib import admin
from .models import Tool, Consumable

@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'quantity', 'condition', 'location')
    search_fields = ('name', 'category')
    list_filter = ('condition', 'category')

@admin.register(Consumable)
class ConsumableAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'quantity_on_hand', 'unit', 'reorder_threshold')
    search_fields = ('item_name',)