from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path
from django.views.static import serve
from django.shortcuts import render
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('livestock.urls')),
    path('api/', include('inventory.urls')),
    path('api/', include('workforce.urls')),
    path('api/', include('commerce.urls')),
    path('api/produce/', include('produce.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catch-all for React frontend
# This must be the LAST pattern to avoid blocking API/admin routes
urlpatterns += [
    re_path(r'^.*$', lambda request: render(request, 'index.html'))
]
