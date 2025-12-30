from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', _('Super Admin')
        FARM_MANAGER = 'FARM_MANAGER', _('Farm Manager')
        VETERINARIAN = 'VETERINARIAN', _('Veterinarian')
        WORKER = 'WORKER', _('Worker')
        ACCOUNTANT = 'ACCOUNTANT', _('Accountant')

    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.WORKER)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # We remove the username requirement if we want to log in with email
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
