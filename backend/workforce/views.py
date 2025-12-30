from rest_framework import viewsets, permissions
from .models import Worker, Attendance, Kibarua
from .serializers import WorkerSerializer, AttendanceSerializer, KibaruaSerializer

class WorkerViewSet(viewsets.ModelViewSet):
    queryset = Worker.objects.all()
    serializer_class = WorkerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from core.models import Farm
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

class KibaruaViewSet(viewsets.ModelViewSet):
    queryset = Kibarua.objects.all()
    serializer_class = KibaruaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from core.models import Farm
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)
