from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/profile/', include('apps.profiles.urls')),
    path('api/generate/', include('apps.generator.urls')),
    path('', include('social_django.urls', namespace='social')),
]
