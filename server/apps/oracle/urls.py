from django.urls import path
from .views import EvaluateSubmissionView, KPIScorecardView

urlpatterns = [
    path('evaluate', EvaluateSubmissionView.as_view(), name='oracle-evaluate'),
    path('kpis', KPIScorecardView.as_view(), name='oracle-kpis'),
]
