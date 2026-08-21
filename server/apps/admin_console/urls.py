from django.urls import path
from .views import (
    OverviewStatsView,
    UserManagementView,
    UserDetailActionView,
    AdminRoleManagementView,
    AdminNullifyPasswordView,
    AdminStaffManagementView,
    AdminCourseManagementView,
    AdminSecurityEventsView,
    CohortView,
    CohortDeployView,
    ValidationQueueView,
    GuardrailRunView
)

urlpatterns = [
    # Static endpoints registered first
    path('overview-stats', OverviewStatsView.as_view(), name='admin-overview-stats'),
    path('users', UserManagementView.as_view(), name='admin-users'),
    path('staff', AdminStaffManagementView.as_view(), name='admin-staff-management'),
    path('courses', AdminCourseManagementView.as_view(), name='admin-courses'),
    path('security-events', AdminSecurityEventsView.as_view(), name='admin-security-events'),
    path('cohorts', CohortView.as_view(), name='admin-cohorts'),
    path('cohorts/<int:cohort_id>/deploy', CohortDeployView.as_view(), name='admin-cohort-deploy'),
    path('validation-queue', ValidationQueueView.as_view(), name='admin-validation-queue'),
    path('guardrails/run', GuardrailRunView.as_view(), name='admin-guardrails-run'),

    # Dynamic User Action endpoints
    path('users/<int:user_id>', UserDetailActionView.as_view(), name='admin-user-action'),
    path('users/<int:user_id>/role', AdminRoleManagementView.as_view(), name='admin-user-role'),
    path('users/<int:user_id>/nullify-password', AdminNullifyPasswordView.as_view(), name='admin-user-nullify-password'),
]
