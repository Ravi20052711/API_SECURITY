from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from apps.guided_exercises.views import get_authenticated_user
from apps.guided_exercises.models import UserProgress, UserLabSession
from apps.guided_exercises.challenge_registry import ChallengeRegistry
from .models import UserAIConversation
from .qwen_service import QwenAIService

def get_user_progress_summary(user_email):
    challenges = ChallengeRegistry.get_all_challenges()
    user_items = []
    for ch in challenges:
        prog = UserProgress.objects.filter(user_email=user_email, exercise_id=ch['exercise_id']).first()
        user_items.append({
            'exercise_id': ch['exercise_id'],
            'lab_id': ch['lab_id'],
            'title': ch['title'],
            'status': prog.status if prog else 'NOT_STARTED',
            'score': prog.score if prog else 0
        })

    completed_count = sum(1 for item in user_items if item['status'] == 'COMPLETED')
    total_exercises = len(user_items)
    completion_rate = int((completed_count / total_exercises) * 100) if total_exercises > 0 else 0
    total_score = sum(item['score'] for item in user_items)

    return {
        'completed_count': completed_count,
        'total_exercises': total_exercises,
        'completion_rate': completion_rate,
        'total_score': total_score,
        'items': user_items
    }


class AIGreetingView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        auth_user = get_authenticated_user(request)
        user_email = auth_user.email
        display_name = auth_user.username or auth_user.first_name or user_email.split('@')[0]

        prog_data = get_user_progress_summary(user_email)
        exp = QwenAIService.determine_experience_level(prog_data)
        greeting = QwenAIService.generate_greeting(display_name, user_email, prog_data, prog_data['items'])

        UserAIConversation.objects.create(
            user_email=user_email,
            role='assistant',
            message=greeting
        )

        return Response({
            'user_email': user_email,
            'user_name': display_name,
            'greeting': greeting,
            'experience_level': exp,
            'ai_available': QwenAIService.is_qwen_available(),
            'progress_summary': {
                'completion_rate': prog_data['completion_rate'],
                'completed_count': prog_data['completed_count'],
                'total_exercises': prog_data['total_exercises']
            }
        }, status=status.HTTP_200_OK)


class AIChatView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        auth_user = get_authenticated_user(request)
        user_email = auth_user.email
        display_name = auth_user.username or auth_user.first_name or user_email.split('@')[0]

        message = request.data.get('message', '').strip()
        page_context = request.data.get('page_context', None)

        if not message:
            return Response({'error': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        UserAIConversation.objects.create(
            user_email=user_email,
            role='user',
            message=message
        )

        active_sess = UserLabSession.objects.filter(user_email=user_email, status='RUNNING').first()
        active_lab = None
        if active_sess:
            ch = ChallengeRegistry.get_challenge(active_sess.exercise_id)
            active_lab = {
                'exercise_id': active_sess.exercise_id,
                'lab_id': ch.get('lab_id'),
                'title': ch.get('title'),
                'port': active_sess.assigned_port
            }

        prog_data = get_user_progress_summary(user_email)
        reply = QwenAIService.generate_learning_advice(
            display_name, message, prog_data, prog_data['items'],
            active_lab=active_lab, page_context=page_context
        )

        UserAIConversation.objects.create(
            user_email=user_email,
            role='assistant',
            message=reply
        )

        return Response({
            'user_email': user_email,
            'reply': reply
        }, status=status.HTTP_200_OK)


class AIHistoryView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        auth_user = get_authenticated_user(request)
        user_email = auth_user.email

        history = UserAIConversation.objects.filter(user_email=user_email).order_by('timestamp')
        data = [{
            'id': item.id,
            'role': item.role,
            'message': item.message,
            'timestamp': item.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        } for item in history]

        return Response(data, status=status.HTTP_200_OK)


class AIHealthView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        available = QwenAIService.is_qwen_available()
        model_name = QwenAIService.get_active_model()
        return Response({
            'status': 'ONLINE' if available else 'OFFLINE',
            'model': model_name,
            'url': QwenAIService.OLLAMA_GENERATE_URL
        }, status=status.HTTP_200_OK)
