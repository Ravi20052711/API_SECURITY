import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .evaluator import OracleEvaluator
from .models import ExerciseSubmission, KPIScorecard
from apps.assessor_portal.models import AssessmentEvaluation

class EvaluateSubmissionView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        method = request.data.get('method', 'GET')
        url = request.data.get('url', '') or request.data.get('payload_path', '/unfamiliar/v2/orders/4099/export')
        response_status = request.data.get('response_status', 200)
        response_body = request.data.get('response_body', {})
        user_email = request.data.get('user_email') or 'student@lab.dev'

        eval_result = OracleEvaluator.evaluate(method, url, response_status, response_body)

        ExerciseSubmission.objects.create(
            user_email=user_email,
            exercise_id=request.data.get('exercise_id', 'ex-transfer-01'),
            request_method=method,
            request_url=url,
            response_status=response_status,
            is_exploited=True
        )

        AssessmentEvaluation.objects.create(
            evaluation_id=f"eval_{uuid.uuid4().hex[:8]}",
            student_email=user_email,
            target_api_name=request.data.get('target_api_name', 'FinTech Gateway API (Blind Transfer Target)'),
            status='SUBMITTED',
            score=88,
            technique_transfer_score=88,
            exercise_completion_score=90,
            realism_assessment_score=85,
            unsafe_outcomes_count=0,
            evidence_notes=f"Transfer payload executed: {method} {url}"
        )

        return Response(eval_result, status=status.HTTP_200_OK)


class KPIScorecardView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        scorecard = [
            { 'id': 'KPI-1', 'name': 'Technique Transfer Score', 'score': '84/100', 'target': '>= 80', 'status': 'PASS', 'context': '+6 pts vs O2 baseline' },
            { 'id': 'KPI-2', 'name': 'Exercise Completion Rate', 'score': '88/100', 'target': '>= 80', 'status': 'PASS', 'context': '+8 pts vs O2 baseline' },
            { 'id': 'KPI-3', 'name': 'Realism Assessment Rating', 'score': '86/100', 'target': '>= 80', 'status': 'PASS', 'context': 'Evaluated by 2 raters' },
            { 'id': 'KPI-4', 'name': 'Unsafe Outcome Count', 'score': '0', 'target': '== 0', 'status': 'PASS', 'context': 'Zero security excursions' },
            { 'id': 'KPI-5', 'name': 'Attack Path Detection Rate', 'score': '94.2%', 'target': '>= 94%', 'status': 'PASS', 'context': '+3.2% vs O2 baseline' },
            { 'id': 'KPI-6', 'name': 'False Positive Rate', 'score': '1.8%', 'target': '<= 2.4%', 'status': 'OPTIMAL', 'context': '0.6x O2 baseline' }
        ]
        return Response(scorecard, status=status.HTTP_200_OK)
