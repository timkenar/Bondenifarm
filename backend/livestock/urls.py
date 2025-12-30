from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LivestockViewSet, AnimalHealthRecordViewSet

router = DefaultRouter()
router.register(r'livestock', LivestockViewSet)
router.register(r'health-records', AnimalHealthRecordViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
