from rest_framework import serializers
from .models import ProduceRecord

class ProduceRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduceRecord
        fields = '__all__'
        read_only_fields = ['farm', 'crates']  # crates is calculated
