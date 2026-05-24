from rest_framework import permissions, viewsets
from rest_framework.exceptions import ValidationError

from core.models import Farm

from .models import (
    AnimalGroup,
    AnimalHealthRecord,
    BreedingRecord,
    FeedingProgram,
    Livestock,
    MortalityRecord,
    VaccinationSchedule,
)
from .serializers import (
    AnimalGroupSerializer,
    AnimalHealthRecordSerializer,
    BreedingRecordSerializer,
    FeedingProgramSerializer,
    LivestockSerializer,
    MortalityRecordSerializer,
    VaccinationScheduleSerializer,
)


def get_current_farm():
    farm = Farm.objects.first()
    if not farm:
        farm = Farm.objects.create(name='Default Farm')
    return farm


def validate_farm_relation(instance, farm, field_name):
    if instance and getattr(instance, 'farm', None) != farm:
        raise ValidationError({field_name: f'Selected {field_name} does not belong to the current farm.'})


class LivestockViewSet(viewsets.ModelViewSet):
    queryset = Livestock.objects.all()
    serializer_class = LivestockSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return Livestock.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('group'), farm, 'group')
        serializer.save(farm=farm)


class AnimalGroupViewSet(viewsets.ModelViewSet):
    queryset = AnimalGroup.objects.all()
    serializer_class = AnimalGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return AnimalGroup.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        serializer.save(farm=farm)


class AnimalHealthRecordViewSet(viewsets.ModelViewSet):
    queryset = AnimalHealthRecord.objects.all()
    serializer_class = AnimalHealthRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return AnimalHealthRecord.objects.filter(livestock__farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data['livestock'], farm, 'livestock')
        serializer.save()


class BreedingRecordViewSet(viewsets.ModelViewSet):
    queryset = BreedingRecord.objects.all()
    serializer_class = BreedingRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return BreedingRecord.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data['dam'], farm, 'dam')
        validate_farm_relation(serializer.validated_data.get('sire'), farm, 'sire')
        serializer.save(farm=farm)


class VaccinationScheduleViewSet(viewsets.ModelViewSet):
    queryset = VaccinationSchedule.objects.all()
    serializer_class = VaccinationScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return VaccinationSchedule.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('livestock'), farm, 'livestock')
        validate_farm_relation(serializer.validated_data.get('group'), farm, 'group')
        serializer.save(farm=farm)


class MortalityRecordViewSet(viewsets.ModelViewSet):
    queryset = MortalityRecord.objects.all()
    serializer_class = MortalityRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return MortalityRecord.objects.filter(livestock__farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data['livestock'], farm, 'livestock')
        serializer.save()


class FeedingProgramViewSet(viewsets.ModelViewSet):
    queryset = FeedingProgram.objects.all()
    serializer_class = FeedingProgramSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return FeedingProgram.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        validate_farm_relation(serializer.validated_data.get('livestock'), farm, 'livestock')
        validate_farm_relation(serializer.validated_data.get('group'), farm, 'group')
        serializer.save(farm=farm)
