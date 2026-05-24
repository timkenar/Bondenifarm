from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FarmPlotViewSet, FarmProfileView, LandingContentView

router = DefaultRouter()
router.register(r'farm/plots', FarmPlotViewSet, basename='farm-plot')

urlpatterns = [
    # Singleton farm profile — GET / PATCH / PUT
    path('farm/profile/', FarmProfileView.as_view(), name='farm-profile'),
    # Public CMS content for the landing page — GET public, PATCH/PUT authenticated
    path('landing/content/', LandingContentView.as_view(), name='landing-content'),
    # Plots CRUD via router
    path('', include(router.urls)),
]
