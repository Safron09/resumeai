from rest_framework import serializers
from .models import ResumeJob, ResumeResult


class GenerateJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeJob
        fields = ('job_description', 'template', 'tone', 'humanization_level', 'imperfection_mode')

    def validate_humanization_level(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Must be between 1 and 5.')
        return value


class JobStatusSerializer(serializers.ModelSerializer):
    result_id = serializers.SerializerMethodField()

    class Meta:
        model = ResumeJob
        fields = ('id', 'status', 'result_id', 'created_at')

    def get_result_id(self, obj):
        if obj.status == ResumeJob.Status.DONE:
            try:
                return obj.result.id
            except ResumeResult.DoesNotExist:
                pass
        return None


class HistorySerializer(serializers.ModelSerializer):
    ats_score = serializers.SerializerMethodField()
    human_score = serializers.SerializerMethodField()
    keyword_match = serializers.SerializerMethodField()

    class Meta:
        model = ResumeJob
        fields = (
            'id', 'template', 'tone', 'humanization_level', 'imperfection_mode',
            'status', 'created_at',
            'ats_score', 'human_score', 'keyword_match',
        )

    def _result(self, obj):
        try:
            return obj.result
        except ResumeResult.DoesNotExist:
            return None

    def get_ats_score(self, obj):
        r = self._result(obj)
        return r.ats_score if r else None

    def get_human_score(self, obj):
        r = self._result(obj)
        return r.human_score if r else None

    def get_keyword_match(self, obj):
        r = self._result(obj)
        return r.keyword_match if r else None


class ResumeResultSerializer(serializers.ModelSerializer):
    template = serializers.CharField(source='job.template')
    tone = serializers.CharField(source='job.tone')
    humanization_level = serializers.IntegerField(source='job.humanization_level')
    imperfection_mode = serializers.BooleanField(source='job.imperfection_mode')
    job_description = serializers.CharField(source='job.job_description')
    created_at = serializers.DateTimeField(source='job.created_at')

    class Meta:
        model = ResumeResult
        fields = (
            'id', 'content', 'ats_score', 'human_score', 'keyword_match',
            'pdf_url', 'docx_url',
            'template', 'tone', 'humanization_level', 'imperfection_mode',
            'job_description', 'created_at',
        )
