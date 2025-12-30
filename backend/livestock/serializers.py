from rest_framework import serializers
from .models import Livestock, AnimalHealthRecord

class LivestockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livestock
        fields = '__all__'
        read_only_fields = ['farm']

class AnimalHealthRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalHealthRecord
        fields = '__all__'
