from rest_framework import serializers
from .models import Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer, KnowledgeGainSummary

class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'question_code', 'category', 'text', 'option_a', 'option_b', 'option_c', 'option_d']

class AssessmentSerializer(serializers.ModelSerializer):
    questions = AssessmentQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = ['id', 'title', 'assessment_type', 'version', 'description', 'questions']

class AssessmentAnswerSerializer(serializers.ModelSerializer):
    question_code = serializers.CharField(source='question.question_code', read_only=True)
    category = serializers.CharField(source='question.category', read_only=True)

    class Meta:
        model = AssessmentAnswer
        fields = ['id', 'question', 'question_code', 'category', 'selected_option', 'is_correct']

class AssessmentAttemptSerializer(serializers.ModelSerializer):
    answers = AssessmentAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = AssessmentAttempt
        fields = [
            'id', 'participant_email', 'assessment_type', 'question_set_version',
            'status', 'score_percentage', 'total_questions', 'correct_answers_count',
            'start_time', 'end_time', 'answers'
        ]

class KnowledgeGainSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeGainSummary
        fields = ['participant_email', 'pre_test_score', 'post_test_score', 'absolute_gain', 'normalized_gain', 'updated_at']
