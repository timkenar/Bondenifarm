from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkerViewSet, AttendanceViewSet, KibaruaViewSet

router = DefaultRouter()
router.register(r'workers', WorkerViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'kibarua', KibaruaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
