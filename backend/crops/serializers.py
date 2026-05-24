from rest_framework import serializers

from .models import CropActivity, CropSeason, HarvestRecord, PestDisease


class CropActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CropActivity
        fields = '__all__'


class CropSeasonSerializer(serializers.ModelSerializer):
    activities = CropActivitySerializer(many=True, read_only=True)

    class Meta:
        model = CropSeason
        fields = '__all__'
        read_only_fields = ['farm']


class PestDiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PestDisease
        fields = '__all__'


class HarvestRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestRecord
        fields = '__all__'
