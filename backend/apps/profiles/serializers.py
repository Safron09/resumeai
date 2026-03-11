from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ('id', 'linkedin_pdf_url', 'resume_pdf_url', 'parsed_data', 'created_at', 'updated_at')
        read_only_fields = fields
