from rest_framework import viewsets, permissions
from .models import Livestock, AnimalHealthRecord
from .serializers import LivestockSerializer, AnimalHealthRecordSerializer

class LivestockViewSet(viewsets.ModelViewSet):
    queryset = Livestock.objects.all()
    serializer_class = LivestockSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Optional: Filter by farm if we had multi-tenancy, for now show all

    def perform_create(self, serializer):
        # Automatically assign to the first farm found for now (Single Tenant Logic)
        from core.models import Farm
        farm = Farm.objects.first()
        if not farm:
            farm = Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)

class AnimalHealthRecordViewSet(viewsets.ModelViewSet):
    queryset = AnimalHealthRecord.objects.all()
    serializer_class = AnimalHealthRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
