from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleViewSet, PurchaseViewSet, ExpenditureViewSet

router = DefaultRouter()
router.register(r'sales', SaleViewSet)
router.register(r'purchases', PurchaseViewSet)
router.register(r'expenditure', ExpenditureViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
