from django.conf import settings
from django.db import models


class ResumeJob(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        PROCESSING = 'processing', 'Processing'
        DONE = 'done', 'Done'
        FAILED = 'failed', 'Failed'

    class Template(models.TextChoices):
        CLASSIC = 'Classic', 'Classic'
        MODERN = 'Modern', 'Modern'
        MINIMAL = 'Minimal', 'Minimal'

    class Tone(models.TextChoices):
        FORMAL = 'Formal', 'Formal'
        BALANCED = 'Balanced', 'Balanced'
        CASUAL = 'Casual', 'Casual'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resume_jobs',
    )
    job_description = models.TextField()
    template = models.CharField(max_length=20, choices=Template.choices, default=Template.CLASSIC)
    tone = models.CharField(max_length=20, choices=Tone.choices, default=Tone.BALANCED)
    humanization_level = models.PositiveSmallIntegerField(default=3)
    imperfection_mode = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'ResumeJob({self.user.email}, {self.status})'


class ResumeResult(models.Model):
    job = models.OneToOneField(ResumeJob, on_delete=models.CASCADE, related_name='result')
    content = models.JSONField(default=dict)
    ats_score = models.PositiveSmallIntegerField(default=0)
    human_score = models.PositiveSmallIntegerField(default=0)
    keyword_match = models.PositiveSmallIntegerField(default=0)
    pdf_url = models.URLField(blank=True)
    docx_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'ResumeResult(job={self.job_id}, ats={self.ats_score})'
