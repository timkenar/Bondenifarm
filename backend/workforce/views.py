from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from core.models import Farm

from .models import Attendance, Department, Kibarua, LeaveRequest, PayrollRecord, Worker
from .serializers import (
    AttendanceSerializer,
    DepartmentSerializer,
    KibaruaSerializer,
    LeaveRequestSerializer,
    PayrollRecordSerializer,
    WorkerSerializer,
)


def get_current_farm():
    farm = Farm.objects.first()
    if not farm:
        farm = Farm.objects.create(name='Default Farm')
    return farm


def validate_farm_relation(instance, farm, field_name):
    if instance and getattr(instance, 'farm', None) != farm:
        raise ValidationError({field_name: f'Selected {field_name} does not belong to the current farm.'})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Department.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('head'), farm, 'head')
        serializer.save(farm=farm)


class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Worker.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('department'), farm, 'department')
        serializer.save(farm=farm)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Attendance.objects.filter(worker__farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data['worker'], farm, 'worker')
        serializer.save()


class KibaruaViewSet(viewsets.ModelViewSet):
    queryset = Kibarua.objects.all()
    serializer_class = KibaruaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Kibarua.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('worker'), farm, 'worker')
        serializer.save(farm=farm)


class PayrollRecordViewSet(viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.all()
    serializer_class = PayrollRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return PayrollRecord.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data['worker'], farm, 'worker')
        serializer.save(farm=farm)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return LeaveRequest.objects.filter(worker__farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data['worker'], farm, 'worker')
        serializer.save()
