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
    "Return JSON only with this exact structure: "
    "{ "
    "\"name\": \"full name\", "
    "\"headline\": \"current job title or professional headline\", "
    "\"contact\": { "
    "  \"email\": \"email address or empty string\", "
    "  \"phone\": \"phone number or empty string\", "
    "  \"location\": \"city, state/country or empty string\", "
    "  \"linkedin\": \"full LinkedIn URL or empty string\", "
    "  \"github\": \"full GitHub URL or empty string\" "
    "}, "
    "\"summary\": \"professional summary\", "
    "\"experience\": [{\"company\": \"\", \"title\": \"\", \"dates\": \"\", \"bullets\": []}], "
    "\"education\": [{\"school\": \"\", \"degree\": \"\", \"dates\": \"\"}], "
    "\"skills\": [\"skill1\", \"skill2\"] "
    "}. "
    "Return only valid JSON, no other text."
)


def _cloudinary_configured() -> bool:
    import os
    return bool(os.getenv('CLOUDINARY_URL', '').strip())


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
        plain_text = request.data.get('plain_text', '').strip()

        if not linkedin_pdf and not plain_text:
            return Response({'detail': 'Provide either linkedin_pdf or plain_text.'}, status=status.HTTP_400_BAD_REQUEST)

        if plain_text and len(plain_text) < 50:
            return Response({'detail': 'Plain text must be at least 50 characters.'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = request.user.id
        linkedin_url = ''
        resume_url = ''

        if linkedin_pdf:
            linkedin_content = linkedin_pdf.read()

            # Upload LinkedIn PDF to Cloudinary (skipped if CLOUDINARY_URL is not set)
            if _cloudinary_configured():
                try:
                    linkedin_url = _upload_to_cloudinary(
                        linkedin_content, 'resumeai/linkedin', f'linkedin_{user_id}'
                    )
                except Exception as e:
                    logger.warning('Cloudinary upload failed (non-fatal): %s', e)
            else:
                logger.info('CLOUDINARY_URL not set — skipping LinkedIn PDF upload')

            # Upload optional resume PDF
            if resume_pdf and _cloudinary_configured():
                try:
                    resume_url = _upload_to_cloudinary(
                        resume_pdf.read(), 'resumeai/resumes', f'resume_{user_id}'
                    )
                except Exception as e:
                    logger.warning('Resume upload failed (non-fatal): %s', e)

            # Extract text from PDF
            try:
                text = _extract_pdf_text(linkedin_content)
            except Exception as e:
                logger.error('PDF parsing failed: %s', e)
                return Response({'detail': 'Could not read PDF. Make sure it is a valid LinkedIn export.'}, status=status.HTTP_400_BAD_REQUEST)

            if not text.strip():
                return Response({'detail': 'PDF appears to be empty or image-only.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            text = plain_text

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
