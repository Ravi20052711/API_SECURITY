from django.urls import path
from .views import (
    AssessorQueueView,
    AssessorEvaluationDetailView,
    AssessorScoreEvaluationView,
    AssessorKPIMetricsView
)

urlpatterns = [
    path('queue', AssessorQueueView.as_view(), name='assessor_queue'),
    path('evaluations/<int:eval_id>', AssessorEvaluationDetailView.as_view(), name='assessor_eval_detail'),
    path('evaluations/<int:eval_id>/score', AssessorScoreEvaluationView.as_view(), name='assessor_score_eval'),
    path('kpis', AssessorKPIMetricsView.as_view(), name='assessor_kpis'),
]
