from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FarmPlotViewSet, FarmViewSet

router = DefaultRouter()
router.register(r'farm', FarmViewSet, basename='farm')
router.register(r'farm-plots', FarmPlotViewSet, basename='farm-plot')

urlpatterns = [
    path('', include(router.urls)),
]
