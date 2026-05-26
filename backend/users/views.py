from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CsrfView(generics.GenericAPIView):
    """Priming endpoint — a GET here sets the `csrftoken` cookie that the
    frontend must echo back as the `X-CSRFToken` header on unsafe requests
    (POST/PUT/PATCH/DELETE) when DRF's SessionAuthentication is in play.

    Call once on app boot: GET /api/auth/csrf/  (with `credentials: 'include'`).
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return Response({'detail': 'CSRF cookie set'})
