from rest_framework import serializers

from .models import Attendance, Department, Kibarua, LeaveRequest, PayrollRecord, Worker


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'
        read_only_fields = ['farm']


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


class PayrollRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayrollRecord
        fields = '__all__'
        read_only_fields = ['farm']


class LeaveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveRequest
        fields = '__all__'
