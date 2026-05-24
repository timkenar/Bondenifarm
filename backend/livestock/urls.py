from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AnimalGroupViewSet,
    AnimalHealthRecordViewSet,
    BreedingRecordViewSet,
    FeedingProgramViewSet,
    LivestockViewSet,
    MortalityRecordViewSet,
    VaccinationScheduleViewSet,
)

router = DefaultRouter()
router.register(r'livestock', LivestockViewSet)
router.register(r'animal-groups', AnimalGroupViewSet)
router.register(r'health-records', AnimalHealthRecordViewSet)
router.register(r'breeding-records', BreedingRecordViewSet)
router.register(r'vaccination-schedules', VaccinationScheduleViewSet)
router.register(r'mortality-records', MortalityRecordViewSet)
router.register(r'feeding-programs', FeedingProgramViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
