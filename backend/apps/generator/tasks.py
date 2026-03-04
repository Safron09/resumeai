import logging

from celery import shared_task

from .models import ResumeJob, ResumeResult
from .services.ai_pipeline import run_pipeline
from .services.export import export_resume

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=0)
def run_generation_pipeline(self, job_id: int):
    try:
        job = ResumeJob.objects.select_related('user', 'user__profile').get(id=job_id)
    except ResumeJob.DoesNotExist:
        logger.error('run_generation_pipeline: job %s not found', job_id)
        return

    job.status = ResumeJob.Status.PROCESSING
    job.save(update_fields=['status'])

    try:
        profile_data = job.user.profile.parsed_data
    except Exception:
        logger.error('run_generation_pipeline: no profile for user %s', job.user_id)
        job.status = ResumeJob.Status.FAILED
        job.save(update_fields=['status'])
        return

    try:
        resume_content, scores = run_pipeline(
            profile_data=profile_data,
            job_description=job.job_description,
            humanization_level=job.humanization_level,
            imperfection_mode=job.imperfection_mode,
        )

        pdf_url, docx_url = export_resume(resume_content, job.id, template_name=job.template)

        ResumeResult.objects.create(
            job=job,
            content=resume_content,
            ats_score=int(scores.get('ats_score', 0)),
            human_score=int(scores.get('human_score', 0)),
            keyword_match=int(scores.get('keyword_match', 0)),
            pdf_url=pdf_url,
            docx_url=docx_url,
        )

        job.status = ResumeJob.Status.DONE
        job.save(update_fields=['status'])

        # Increment generations_used only on success
        job.user.generations_used += 1
        job.user.save(update_fields=['generations_used'])

        logger.info('Pipeline done for job %s', job_id)

    except Exception as exc:
        logger.exception('Pipeline failed for job %s: %s', job_id, exc)
        job.status = ResumeJob.Status.FAILED
        job.save(update_fields=['status'])
