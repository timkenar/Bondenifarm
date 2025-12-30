from rest_framework import viewsets, permissions
from .models import ProduceRecord
from .serializers import ProduceRecordSerializer
from core.models import Farm

class ProduceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = ProduceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ProduceRecord.objects.all()

    def perform_create(self, serializer):
        # Assign farm - use first farm or create default
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)

    def perform_update(self, serializer):
        serializer.save()
