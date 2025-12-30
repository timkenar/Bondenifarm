from rest_framework import viewsets, permissions
from .models import Sale, Purchase, Expenditure
from .serializers import SaleSerializer, PurchaseSerializer, ExpenditureSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from core.models import Farm
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        user = self.request.user
        serializer.save(created_by=user, farm=farm)

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from core.models import Farm
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)

class ExpenditureViewSet(viewsets.ModelViewSet):
    queryset = Expenditure.objects.all()
    serializer_class = ExpenditureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        from core.models import Farm
        farm = Farm.objects.first() or Farm.objects.create(name="Default Farm")
        serializer.save(farm=farm)
