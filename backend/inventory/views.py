from rest_framework import viewsets, permissions
from .models import Tool, Consumable
from .serializers import ToolSerializer, ConsumableSerializer

class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from core.models import Farm
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)

class ConsumableViewSet(viewsets.ModelViewSet):
    queryset = Consumable.objects.all()
    serializer_class = ConsumableSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from core.models import Farm
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)
