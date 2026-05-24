from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from core.models import Farm

from .models import Consumable, StockMovement, Supplier, Tool, Warehouse
from .serializers import (
    ConsumableSerializer,
    StockMovementSerializer,
    SupplierSerializer,
    ToolSerializer,
    WarehouseSerializer,
)


def get_current_farm():
    farm = Farm.objects.first()
    if not farm:
        farm = Farm.objects.create(name='Default Farm')
    return farm


def validate_farm_relation(instance, farm, field_name):
    if instance and getattr(instance, 'farm', None) != farm:
        raise ValidationError({field_name: f'Selected {field_name} does not belong to the current farm.'})


class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Warehouse.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        serializer.save(farm=farm)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Supplier.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        serializer.save(farm=farm)


class ToolViewSet(viewsets.ModelViewSet):
    queryset = Tool.objects.all()
    serializer_class = ToolSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Tool.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('warehouse'), farm, 'warehouse')
        validate_farm_relation(serializer.validated_data.get('supplier'), farm, 'supplier')
        serializer.save(farm=farm)


class ConsumableViewSet(viewsets.ModelViewSet):
    queryset = Consumable.objects.all()
    serializer_class = ConsumableSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Consumable.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('warehouse'), farm, 'warehouse')
        validate_farm_relation(serializer.validated_data.get('supplier'), farm, 'supplier')
        serializer.save(farm=farm)


class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return StockMovement.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('consumable'), farm, 'consumable')
        validate_farm_relation(serializer.validated_data.get('tool'), farm, 'tool')
        validate_farm_relation(serializer.validated_data.get('from_warehouse'), farm, 'from_warehouse')
        validate_farm_relation(serializer.validated_data.get('to_warehouse'), farm, 'to_warehouse')
        serializer.save(farm=farm)
