import io

from django.http import FileResponse, Http404
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ResumeJob, ResumeResult
from .serializers import GenerateJobSerializer, JobStatusSerializer, ResumeResultSerializer, HistorySerializer
from .tasks import run_generation_pipeline


class GenerateView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user

        # Enforce free plan limit
        if user.plan == 'free' and user.generations_used >= 5:
            return Response(
                {'detail': 'Generation limit reached. Upgrade to Pro for unlimited generations.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = GenerateJobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        job = ResumeJob.objects.create(user=user, **serializer.validated_data)
        run_generation_pipeline.delay(job.id)

        return Response({'job_id': job.id}, status=status.HTTP_201_CREATED)


class JobStatusView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, job_id):
        job = get_object_or_404(ResumeJob, id=job_id, user=request.user)
        return Response(JobStatusSerializer(job).data)


class JobResultView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, job_id):
        job = get_object_or_404(ResumeJob, id=job_id, user=request.user)

        if job.status != ResumeJob.Status.DONE:
            return Response(
                {'detail': f'Result not ready. Current status: {job.status}'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = get_object_or_404(ResumeResult, job=job)
        return Response(ResumeResultSerializer(result).data)


class DownloadView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, job_id, fmt):
        job = get_object_or_404(ResumeJob, id=job_id, user=request.user)
        if job.status != ResumeJob.Status.DONE:
            raise Http404

        result = get_object_or_404(ResumeResult, job=job)

        if fmt == 'pdf':
            from .services.export import generate_pdf
            data = generate_pdf(result.content, job.template)
            return FileResponse(
                io.BytesIO(data),
                as_attachment=True,
                filename=f'resume_{job_id}.pdf',
                content_type='application/pdf',
            )
        elif fmt == 'docx':
            from .services.export import generate_docx
            data = generate_docx(result.content)
            return FileResponse(
                io.BytesIO(data),
                as_attachment=True,
                filename=f'resume_{job_id}.docx',
                content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            )
        raise Http404


class HistoryListView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        jobs = (
            ResumeJob.objects.filter(user=request.user)
            .select_related('result')
            .order_by('-created_at')[:50]
        )
        return Response(HistorySerializer(jobs, many=True).data)
