from rest_framework import permissions, viewsets
from rest_framework.response import Response

from .models import Farm, FarmPlot
from .serializers import FarmPlotSerializer, FarmSerializer


def get_current_farm():
    farm = Farm.objects.first()
    if not farm:
        farm = Farm.objects.create(name='Default Farm')
    return farm


class FarmViewSet(viewsets.ModelViewSet):
    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        farm = get_current_farm()
        return Farm.objects.filter(pk=farm.pk)

    def get_object(self):
        return get_current_farm()

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response(serializer.data)


class FarmPlotViewSet(viewsets.ModelViewSet):
    serializer_class = FarmPlotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        farm = get_current_farm()
        return FarmPlot.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        serializer.save(farm=farm)
