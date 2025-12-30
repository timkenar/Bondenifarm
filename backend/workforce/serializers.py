from rest_framework import serializers
from .models import Worker, Attendance, Kibarua

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = '__all__'
        read_only_fields = ['farm']

class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'

class KibaruaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kibarua
        fields = '__all__'
        read_only_fields = ['farm']
