from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/profile/', include('apps.profiles.urls')),
    path('api/generate/', include('apps.generator.urls')),
    path('', include('social_django.urls', namespace='social')),
    # Catch-all: serve React SPA for any non-API route
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]
