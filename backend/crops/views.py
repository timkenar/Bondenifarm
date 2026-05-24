from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from core.models import Farm

from .models import CropActivity, CropSeason, HarvestRecord, PestDisease
from .serializers import (
    CropActivitySerializer,
    CropSeasonSerializer,
    HarvestRecordSerializer,
    PestDiseaseSerializer,
)


def get_current_farm():
    farm = Farm.objects.first()
    if not farm:
        farm = Farm.objects.create(name='Default Farm')
    return farm


class CropSeasonViewSet(viewsets.ModelViewSet):
    serializer_class = CropSeasonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return CropSeason.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        serializer.save(farm=farm)


class CropActivityViewSet(viewsets.ModelViewSet):
    serializer_class = CropActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return CropActivity.objects.filter(season__farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        season = serializer.validated_data['season']
        if season.farm != farm:
            raise ValidationError({'season': 'Selected season does not belong to the current farm.'})
        serializer.save()


class PestDiseaseViewSet(viewsets.ModelViewSet):
    serializer_class = PestDiseaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return PestDisease.objects.filter(season__farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        season = serializer.validated_data['season']
        if season.farm != farm:
            raise ValidationError({'season': 'Selected season does not belong to the current farm.'})
        serializer.save()


class HarvestRecordViewSet(viewsets.ModelViewSet):
    serializer_class = HarvestRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return HarvestRecord.objects.filter(season__farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        season = serializer.validated_data['season']
        if season.farm != farm:
            raise ValidationError({'season': 'Selected season does not belong to the current farm.'})
        serializer.save()
