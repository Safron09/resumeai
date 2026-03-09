from django.urls import path
from . import views

urlpatterns = [
    path('', views.GenerateView.as_view(), name='generate'),
    path('history/', views.HistoryListView.as_view(), name='history-list'),
    path('<int:job_id>/status/', views.JobStatusView.as_view(), name='job-status'),
    path('<int:job_id>/result/', views.JobResultView.as_view(), name='job-result'),
    path('<int:job_id>/download/<str:fmt>/', views.DownloadView.as_view(), name='job-download'),
]
