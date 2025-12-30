from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ToolViewSet, ConsumableViewSet

router = DefaultRouter()
router.register(r'tools', ToolViewSet)
router.register(r'consumables', ConsumableViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
