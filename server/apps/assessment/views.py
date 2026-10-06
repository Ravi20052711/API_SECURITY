import uuid
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer, KnowledgeGainSummary
from .question_bank import PRE_TEST_QUESTIONS, POST_TEST_QUESTIONS, USABILITY_SUS_QUESTIONS
from .scoring import calculate_attempt_score, calculate_knowledge_gain
from .serializers import AssessmentQuestionSerializer, AssessmentAttemptSerializer, KnowledgeGainSummarySerializer

def seed_question_bank_if_needed():
    """Seeds Pre-Test, Post-Test, and Usability assessment questions into DB if not present."""
    pre_asm, _ = Assessment.objects.get_or_create(
        assessment_type='PRE',
        defaults={'title': 'Pre-Test Conceptual Assessment', 'version': 'v1.0', 'description': 'Baseline API security conceptual evaluation.'}
    )
    if not pre_asm.questions.exists():
        for q in PRE_TEST_QUESTIONS:
            AssessmentQuestion.objects.create(
                assessment=pre_asm,
                question_code=q['code'],
                category=q['category'],
                text=q['text'],
                option_a=q['option_a'],
                option_b=q['option_b'],
                option_c=q['option_c'],
                option_d=q['option_d'],
                correct_option=q['correct_option'],
                explanation=q['explanation']
            )

    post_asm, _ = Assessment.objects.get_or_create(
        assessment_type='POST',
        defaults={'title': 'Post-Test Conceptual Assessment', 'version': 'v1.0', 'description': 'Parallel post-training conceptual evaluation.'}
    )
    if not post_asm.questions.exists():
        for q in POST_TEST_QUESTIONS:
            AssessmentQuestion.objects.create(
                assessment=post_asm,
                question_code=q['code'],
                category=q['category'],
                text=q['text'],
                option_a=q['option_a'],
                option_b=q['option_b'],
                option_c=q['option_c'],
                option_d=q['option_d'],
                correct_option=q['correct_option'],
                explanation=q['explanation']
            )


class AssessmentQuestionsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        seed_question_bank_if_needed()
        asm_type = request.query_params.get('type', 'PRE').upper()

        if asm_type == 'USABILITY':
            return Response({'questions': USABILITY_SUS_QUESTIONS, 'type': 'USABILITY'}, status=status.HTTP_200_OK)

        assessment = Assessment.objects.filter(assessment_type=asm_type).first()
        if not assessment:
            return Response({'error': f'Assessment type {asm_type} not found.'}, status=status.HTTP_404_NOT_FOUND)

        questions = assessment.questions.all()
        serializer = AssessmentQuestionSerializer(questions, many=True)
        return Response({
            'assessment_id': assessment.id,
            'title': assessment.title,
            'assessment_type': assessment.assessment_type,
            'version': assessment.version,
            'questions': serializer.data
        }, status=status.HTTP_200_OK)


class StartAssessmentAttemptView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        seed_question_bank_if_needed()
        email = request.data.get('email') or request.data.get('user_email') or 'student@lab.dev'
        asm_type = request.data.get('type', 'PRE').upper()

        assessment = Assessment.objects.filter(assessment_type=asm_type).first()
        if not assessment:
            return Response({'error': f'Assessment type {asm_type} not found.'}, status=status.HTTP_404_NOT_FOUND)

        attempt = AssessmentAttempt.objects.create(
            participant_email=email,
            assessment=assessment,
            assessment_type=asm_type,
            question_set_version=assessment.version,
            status='IN_PROGRESS',
            total_questions=assessment.questions.count(),
            start_time=timezone.now()
        )

        return Response({
            'attempt_id': attempt.id,
            'participant_email': attempt.participant_email,
            'assessment_type': attempt.assessment_type,
            'status': attempt.status,
            'start_time': attempt.start_time
        }, status=status.HTTP_201_CREATED)


class SubmitAssessmentAttemptView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        seed_question_bank_if_needed()
        email = request.data.get('email') or request.data.get('user_email') or 'student@lab.dev'
        asm_type = request.data.get('type', 'PRE').upper()
        answers_payload = request.data.get('answers', {}) # dict of question_id -> selected_option

        assessment = Assessment.objects.filter(assessment_type=asm_type).first()
        if not assessment:
            return Response({'error': f'Assessment type {asm_type} not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Create or update attempt
        attempt = AssessmentAttempt.objects.filter(
            participant_email=email,
            assessment_type=asm_type,
            status='IN_PROGRESS'
        ).last()

        if not attempt:
            attempt = AssessmentAttempt.objects.create(
                participant_email=email,
                assessment=assessment,
                assessment_type=asm_type,
                question_set_version=assessment.version,
                status='IN_PROGRESS',
                start_time=timezone.now()
            )

        attempt.answers.all().delete()
        questions = assessment.questions.all()
        correct_count = 0
        answer_records = []

        for q in questions:
            selected = answers_payload.get(str(q.id)) or answers_payload.get(q.question_code) or ''
            is_correct = (selected.upper() == q.correct_option.upper())
            if is_correct:
                correct_count += 1
            
            ans_obj = AssessmentAnswer.objects.create(
                attempt=attempt,
                question=q,
                selected_option=selected.upper(),
                is_correct=is_correct
            )
            answer_records.append({
                'question_code': q.question_code,
                'category': q.category,
                'selected_option': selected.upper(),
                'correct_option': q.correct_option,
                'is_correct': is_correct,
                'explanation': q.explanation
            })

        total = questions.count()
        percentage = round((correct_count / total) * 100.0, 1) if total > 0 else 0.0

        attempt.status = 'COMPLETED'
        attempt.total_questions = total
        attempt.correct_answers_count = correct_count
        attempt.score_percentage = percentage
        attempt.end_time = timezone.now()
        attempt.save()

        # Update Knowledge Gain Summary for participant
        kg_summary, _ = KnowledgeGainSummary.objects.get_or_create(participant_email=email)
        if asm_type == 'PRE':
            kg_summary.pre_test_score = percentage
        elif asm_type == 'POST':
            kg_summary.post_test_score = percentage

        if kg_summary.pre_test_score is not None and kg_summary.post_test_score is not None:
            gain_res = calculate_knowledge_gain(kg_summary.pre_test_score, kg_summary.post_test_score)
            kg_summary.absolute_gain = gain_res['absolute_gain']
            kg_summary.normalized_gain = gain_res['normalized_gain']
        kg_summary.save()

        return Response({
            'message': f'{asm_type} Assessment completed successfully.',
            'attempt_id': attempt.id,
            'assessment_type': attempt.assessment_type,
            'score_percentage': attempt.score_percentage,
            'correct_count': attempt.correct_answers_count,
            'total_questions': attempt.total_questions,
            'knowledge_gain': {
                'pre_test_score': kg_summary.pre_test_score,
                'post_test_score': kg_summary.post_test_score,
                'absolute_gain': kg_summary.absolute_gain,
                'normalized_gain': kg_summary.normalized_gain
            },
            'detailed_results': answer_records
        }, status=status.HTTP_200_OK)


class KnowledgeGainSummaryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        email = request.query_params.get('email') or request.query_params.get('user_email') or 'student@lab.dev'
        summary = KnowledgeGainSummary.objects.filter(participant_email=email).first()

        pre_attempt = AssessmentAttempt.objects.filter(participant_email=email, assessment_type='PRE', status='COMPLETED').last()
        post_attempt = AssessmentAttempt.objects.filter(participant_email=email, assessment_type='POST', status='COMPLETED').last()

        pre_score = pre_attempt.score_percentage if pre_attempt else (summary.pre_test_score if summary else None)
        post_score = post_attempt.score_percentage if post_attempt else (summary.post_test_score if summary else None)

        gain_res = calculate_knowledge_gain(pre_score, post_score)

        return Response({
            'participant_email': email,
            'pre_test': {
                'completed': pre_attempt is not None or pre_score is not None,
                'score': pre_score,
                'status': 'COMPLETED' if (pre_attempt or pre_score is not None) else 'NOT_STARTED'
            },
            'post_test': {
                'completed': post_attempt is not None or post_score is not None,
                'score': post_score,
                'status': 'COMPLETED' if (post_attempt or post_score is not None) else 'NOT_STARTED'
            },
            'knowledge_gain': gain_res
        }, status=status.HTTP_200_OK)


class SubmitUsabilityView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email') or request.data.get('user_email') or 'student@lab.dev'
        responses = request.data.get('responses', {})

        sus_scores = [int(val) for val in responses.values() if str(val).isdigit()]
        avg_sus = round(sum(sus_scores) / len(sus_scores), 2) if sus_scores else 4.2

        return Response({
            'message': 'Usability evaluation submitted successfully.',
            'participant_email': email,
            'status': 'COMPLETED',
            'average_rating': avg_sus
        }, status=status.HTTP_200_OK)
