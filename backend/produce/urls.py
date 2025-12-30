from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProduceRecordViewSet

router = DefaultRouter()
router.register(r'records', ProduceRecordViewSet, basename='produce-record')

urlpatterns = [
    path('', include(router.urls)),
]
