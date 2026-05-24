from rest_framework import serializers

from .models import (
    AnimalGroup,
    AnimalHealthRecord,
    BreedingRecord,
    FeedingProgram,
    Livestock,
    MortalityRecord,
    VaccinationSchedule,
)


class LivestockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livestock
        fields = '__all__'
        read_only_fields = ['farm']


class AnimalGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalGroup
        fields = '__all__'
        read_only_fields = ['farm']


class AnimalHealthRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnimalHealthRecord
        fields = '__all__'


class BreedingRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreedingRecord
        fields = '__all__'
        read_only_fields = ['farm']


class VaccinationScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = VaccinationSchedule
        fields = '__all__'
        read_only_fields = ['farm']


class MortalityRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MortalityRecord
        fields = '__all__'


class FeedingProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedingProgram
        fields = '__all__'
        read_only_fields = ['farm']
