from django.contrib import admin
from .models import ResumeJob, ResumeResult


@admin.register(ResumeJob)
class ResumeJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'template', 'tone', 'humanization_level', 'imperfection_mode', 'status', 'created_at')
    list_filter = ('status', 'template', 'tone')
    search_fields = ('user__email',)
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ResumeResult)
class ResumeResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'ats_score', 'human_score', 'keyword_match', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
