from django.urls import path
from .views import (
    UserLoginView,
    AdminLoginView,
    RegisterView,
    CurrentUserProfileView,
    ForgotPasswordView,
    ResetPasswordConfirmView
)

urlpatterns = [
    path('user/login', UserLoginView.as_view(), name='user-login'),
    path('admin/login', AdminLoginView.as_view(), name='admin-login'),
    path('signup', RegisterView.as_view(), name='register'),
    path('me', CurrentUserProfileView.as_view(), name='user-profile'),
    path('forgot-password', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/confirm', ResetPasswordConfirmView.as_view(), name='reset_password_confirm'),
]
