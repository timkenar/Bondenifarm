from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ConsumableViewSet,
    StockMovementViewSet,
    SupplierViewSet,
    ToolViewSet,
    WarehouseViewSet,
)

router = DefaultRouter()
router.register(r'warehouses', WarehouseViewSet)
router.register(r'suppliers', SupplierViewSet)
router.register(r'tools', ToolViewSet)
router.register(r'consumables', ConsumableViewSet)
router.register(r'stock-movements', StockMovementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
