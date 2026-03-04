import io
import json
import logging

import anthropic
import cloudinary.uploader
import pdfplumber
from django.conf import settings
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile
from .serializers import ProfileSerializer

logger = logging.getLogger(__name__)

CLAUDE_SYSTEM_PROMPT = (
    "Extract a structured professional profile from this LinkedIn PDF text. "
    "Return JSON only with: name, headline, summary, "
    "experience (array: company, title, dates, bullets), "
    "education (array: school, degree, dates), "
    "skills (array of strings). "
    "Return only valid JSON, no other text."
)


def _upload_to_cloudinary(content: bytes, folder: str, public_id: str) -> str:
    result = cloudinary.uploader.upload(
        content,
        resource_type='raw',
        folder=folder,
        public_id=public_id,
        overwrite=True,
    )
    return result['secure_url']


def _extract_pdf_text(content: bytes) -> str:
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        return '\n'.join(page.extract_text() or '' for page in pdf.pages)


def _parse_with_claude(text: str) -> dict:
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    message = client.messages.create(
        model='claude-sonnet-4-6',
        max_tokens=4096,
        system=CLAUDE_SYSTEM_PROMPT,
        messages=[{'role': 'user', 'content': text}],
    )
    raw = message.content[0].text.strip()
    # Strip markdown code fences if present
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1].rsplit('```', 1)[0]
    return json.loads(raw)


class ProfileUploadView(APIView):
    permission_classes = (IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request):
        linkedin_pdf = request.FILES.get('linkedin_pdf')
        resume_pdf = request.FILES.get('resume_pdf')

        if not linkedin_pdf:
            return Response({'detail': 'linkedin_pdf is required.'}, status=status.HTTP_400_BAD_REQUEST)

        linkedin_content = linkedin_pdf.read()
        user_id = request.user.id

        # Upload LinkedIn PDF to Cloudinary
        try:
            linkedin_url = _upload_to_cloudinary(
                linkedin_content, 'resumeai/linkedin', f'linkedin_{user_id}'
            )
        except Exception as e:
            logger.error('Cloudinary upload failed: %s', e)
            return Response({'detail': 'File upload failed.'}, status=status.HTTP_502_BAD_GATEWAY)

        # Upload optional resume PDF
        resume_url = ''
        if resume_pdf:
            try:
                resume_url = _upload_to_cloudinary(
                    resume_pdf.read(), 'resumeai/resumes', f'resume_{user_id}'
                )
            except Exception as e:
                logger.warning('Resume upload failed (non-fatal): %s', e)

        # Parse LinkedIn PDF text
        try:
            text = _extract_pdf_text(linkedin_content)
        except Exception as e:
            logger.error('PDF parsing failed: %s', e)
            return Response({'detail': 'Could not read PDF. Make sure it is a valid LinkedIn export.'}, status=status.HTTP_400_BAD_REQUEST)

        if not text.strip():
            return Response({'detail': 'PDF appears to be empty or image-only.'}, status=status.HTTP_400_BAD_REQUEST)

        # Parse with Claude
        try:
            parsed_data = _parse_with_claude(text)
        except json.JSONDecodeError:
            logger.warning('Claude returned invalid JSON — storing raw text fallback')
            parsed_data = {'raw_text': text[:5000]}
        except Exception as e:
            logger.error('Claude API error: %s', e)
            return Response({'detail': 'Profile parsing failed. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)

        # Upsert Profile
        Profile.objects.update_or_create(
            user=request.user,
            defaults={
                'linkedin_pdf_url': linkedin_url,
                'resume_pdf_url': resume_url,
                'parsed_data': parsed_data,
            },
        )

        return Response({'message': 'Profile saved'})


class ProfileDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        try:
            profile = request.user.profile
        except Profile.DoesNotExist:
            return Response({'detail': 'No profile found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProfileSerializer(profile).data)
