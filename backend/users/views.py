from rest_framework import viewsets, permissions, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, SelfUpdateSerializer

User = get_user_model()

MANAGER_ROLES = {'SUPER_ADMIN', 'FARM_MANAGER'}


def can_manage_users(user):
    """Only admins/managers may create, edit or remove other team members."""
    return bool(
        user
        and user.is_authenticated
        and (user.is_superuser or user.is_staff or getattr(user, 'role', None) in MANAGER_ROLES)
    )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('full_name', 'email')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def _ensure_can_manage(self, request):
        if not can_manage_users(request.user):
            return Response(
                {'detail': 'You do not have permission to manage team members.'},
                status=403,
            )
        return None

    def create(self, request, *args, **kwargs):
        denied = self._ensure_can_manage(request)
        if denied:
            return denied
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance != request.user and not can_manage_users(request.user):
            return Response(
                {'detail': 'You do not have permission to edit this member.'},
                status=403,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        denied = self._ensure_can_manage(request)
        if denied:
            return denied
        instance = self.get_object()
        if instance == request.user:
            return Response(
                {'detail': 'You cannot delete your own account.'},
                status=400,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)

        serializer = SelfUpdateSerializer(
            request.user, data=request.data, partial=request.method == 'PATCH'
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user, context={'request': request}).data)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
