from rest_framework import generics, permissions, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import Farm, FarmPlot, LandingContent
from .serializers import FarmPlotSerializer, FarmSerializer, LandingContentSerializer


def get_current_farm():
    farm = Farm.objects.first()
    if not farm:
        farm = Farm.objects.create(name='Default Farm')
    return farm


def get_landing_content():
    obj = LandingContent.objects.first()
    if not obj:
        obj = LandingContent.objects.create()
    return obj


class FarmProfileView(generics.RetrieveUpdateAPIView):
    """Singleton endpoint for the farm profile.

    GET    /api/farm/profile/   -> retrieve
    PUT    /api/farm/profile/   -> full update
    PATCH  /api/farm/profile/   -> partial update
    """

    serializer_class = FarmSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        return get_current_farm()


class FarmPlotViewSet(viewsets.ModelViewSet):
    """CRUD for farm plots scoped to the current farm."""

    serializer_class = FarmPlotSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        farm = get_current_farm()
        return FarmPlot.objects.filter(farm=farm)

    def perform_create(self, serializer):
        farm = get_current_farm()
        serializer.save(farm=farm)


class LandingContentView(generics.RetrieveUpdateAPIView):
    """Singleton endpoint for the public landing page CMS content.

    GET    /api/landing/content/   -> retrieve (PUBLIC, no auth required)
    PUT    /api/landing/content/   -> full update (authenticated)
    PATCH  /api/landing/content/   -> partial update (authenticated)
    """

    serializer_class = LandingContentSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        return get_landing_content()
