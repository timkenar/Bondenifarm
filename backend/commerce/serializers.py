from rest_framework import serializers
from .models import Sale, Purchase, Expenditure

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ['created_by', 'total_amount', 'farm']

class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ['farm']

class ExpenditureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenditure
        fields = '__all__'
        read_only_fields = ['farm']
