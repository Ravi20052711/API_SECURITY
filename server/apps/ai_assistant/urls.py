from django.urls import path
from .views import AIGreetingView, AIChatView, AIHistoryView, AIHealthView

urlpatterns = [
    path('greeting', AIGreetingView.as_view(), name='ai-greeting'),
    path('chat', AIChatView.as_view(), name='ai-chat'),
    path('history', AIHistoryView.as_view(), name='ai-history'),
    path('health', AIHealthView.as_view(), name='ai-health'),
]
