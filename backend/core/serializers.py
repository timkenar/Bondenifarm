from rest_framework import serializers

from .models import Farm, FarmPlot


class FarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = '__all__'


class FarmPlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmPlot
        fields = '__all__'
        read_only_fields = ['farm']
