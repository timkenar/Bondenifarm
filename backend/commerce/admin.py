from django.contrib import admin
from .models import Sale, Purchase, Expenditure

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('date', 'product', 'quantity', 'unit', 'total_amount', 'payment_status')
    list_filter = ('product', 'payment_status', 'date')
    search_fields = ('customer_name',)

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('date', 'supplier', 'total_amount')
    list_filter = ('date',)

@admin.register(Expenditure)
class ExpenditureAdmin(admin.ModelAdmin):
    list_display = ('date', 'category', 'amount', 'description')
    list_filter = ('category', 'date')
    search_fields = ('description',)
