from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import UserViewSet, RegisterView, CsrfView

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('auth/csrf/', CsrfView.as_view(), name='api_csrf'),
    path('auth/login/', obtain_auth_token, name='api_token_auth'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
