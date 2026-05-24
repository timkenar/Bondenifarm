from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AttendanceViewSet,
    DepartmentViewSet,
    KibaruaViewSet,
    LeaveRequestViewSet,
    PayrollRecordViewSet,
    WorkerViewSet,
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'workers', WorkerViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'kibarua', KibaruaViewSet)
router.register(r'payroll-records', PayrollRecordViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
