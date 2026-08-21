from django.urls import path
from .views import (
    InstructorLearnersView,
    InstructorLearnerDetailView,
    InstructorAnalyticsView,
    InstructorResetLearnerProgressView
)

urlpatterns = [
    path('learners', InstructorLearnersView.as_view(), name='instructor_learners'),
    path('learners/<int:learner_id>/detail', InstructorLearnerDetailView.as_view(), name='instructor_learner_detail'),
    path('analytics', InstructorAnalyticsView.as_view(), name='instructor_analytics'),
    path('learners/<int:learner_id>/reset-progress', InstructorResetLearnerProgressView.as_view(), name='instructor_reset_progress'),
]
