from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.ProfileUploadView.as_view(), name='profile-upload'),
    path('', views.ProfileDetailView.as_view(), name='profile-detail'),
]
