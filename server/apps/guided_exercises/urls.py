from django.urls import path
from .views import (
    ExerciseListView,
    UserProgressView,
    UserDashboardView,
    StartLabView,
    SessionStatusView,
    PauseLabSessionView,
    ResumeLabSessionView,
    DeleteContainerView,
    ReportResultView,
    ValidateLabView,
    ExitLabView,
    ExerciseEnvironmentView,
    StartExerciseEnvironmentView,
    ExerciseEnvironmentStatusView,
    HintRevealView,
    LabResetView,
    ExportPostmanCollectionView
)

urlpatterns = [
    # Static endpoints MUST be registered FIRST before <str:...> wildcards
    path('catalog', ExerciseListView.as_view(), name='exercise-catalog'),
    path('dashboard/me', UserDashboardView.as_view(), name='user-dashboard-me'),
    path('progress/me', UserProgressView.as_view(), name='user-progress-me'),
    path('progress/record', UserProgressView.as_view(), name='user-progress-record'),
    path('report-result', ReportResultView.as_view(), name='lab-report-result'),
    path('hint', HintRevealView.as_view(), name='exercise-hint'),
    path('reset', LabResetView.as_view(), name='lab-reset'),
    path('export-postman', ExportPostmanCollectionView.as_view(), name='export-postman'),
    
    # Session Timer, Pause, Delete & Validate Endpoints (Wildcards)
    path('<str:session_id>/session-status', SessionStatusView.as_view(), name='lab-session-status'),
    path('<str:session_id>/pause', PauseLabSessionView.as_view(), name='lab-pause'),
    path('<str:session_id>/resume', ResumeLabSessionView.as_view(), name='lab-resume'),
    path('<str:session_id>/delete-container', DeleteContainerView.as_view(), name='lab-delete-container'),
    path('<str:session_id>/validate', ValidateLabView.as_view(), name='lab-validate-session'),

    # Direct lab routes
    path('<str:exercise_id>/start', StartLabView.as_view(), name='lab-start-direct'),
    path('<str:exercise_id>/exit', ExitLabView.as_view(), name='lab-exit-direct'),
    
    path('labs/<str:exercise_id>/start', StartLabView.as_view(), name='lab-start'),
    path('labs/<str:exercise_id>/validate', ValidateLabView.as_view(), name='lab-validate'),
    path('labs/<str:exercise_id>/exit', ExitLabView.as_view(), name='lab-exit'),
    
    path('<str:exercise_id>/environment', ExerciseEnvironmentView.as_view(), name='exercise-environment'),
    path('<str:exercise_id>/status', ExerciseEnvironmentStatusView.as_view(), name='exercise-status'),
]
