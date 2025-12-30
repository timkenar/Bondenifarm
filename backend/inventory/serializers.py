from rest_framework import serializers
from .models import Tool, Consumable

class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = '__all__'
        read_only_fields = ['farm']

class ConsumableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consumable
        fields = '__all__'
        read_only_fields = ['farm']
