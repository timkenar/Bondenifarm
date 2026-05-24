from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CropActivityViewSet,
    CropSeasonViewSet,
    HarvestRecordViewSet,
    PestDiseaseViewSet,
)

router = DefaultRouter()
router.register(r'crops/seasons', CropSeasonViewSet, basename='crop-season')
router.register(r'crops/activities', CropActivityViewSet, basename='crop-activity')
router.register(r'crops/pest-diseases', PestDiseaseViewSet, basename='pest-disease')
router.register(r'crops/harvest-records', HarvestRecordViewSet, basename='harvest-record')

urlpatterns = [
    path('', include(router.urls)),
]
