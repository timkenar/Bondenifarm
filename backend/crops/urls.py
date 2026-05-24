from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CropActivityViewSet,
    CropSeasonViewSet,
    HarvestRecordViewSet,
    PestDiseaseViewSet,
)

router = DefaultRouter()
router.register(r'crop-seasons', CropSeasonViewSet, basename='crop-season')
router.register(r'crop-activities', CropActivityViewSet, basename='crop-activity')
router.register(r'pest-diseases', PestDiseaseViewSet, basename='pest-disease')
router.register(r'harvest-records', HarvestRecordViewSet, basename='harvest-record')

urlpatterns = [
    path('', include(router.urls)),
]
