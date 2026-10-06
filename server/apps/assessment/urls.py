from django.urls import path
from .views import (
    AssessmentQuestionsView,
    StartAssessmentAttemptView,
    SubmitAssessmentAttemptView,
    KnowledgeGainSummaryView,
    SubmitUsabilityView
)

urlpatterns = [
    path('questions', AssessmentQuestionsView.as_view(), name='assessment-questions'),
    path('start', StartAssessmentAttemptView.as_view(), name='assessment-start'),
    path('submit', SubmitAssessmentAttemptView.as_view(), name='assessment-submit'),
    path('summary', KnowledgeGainSummaryView.as_view(), name='assessment-summary'),
    path('usability', SubmitUsabilityView.as_view(), name='assessment-usability'),
]
