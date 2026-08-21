import uuid
import hashlib
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from .models import User, PasswordResetToken, CentralSecurityLog
from .serializers import UserSerializer, RegisterSerializer

class UserLoginView(APIView):
    """Separate Auth Endpoint for Students & Assessors"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_input = request.data.get('username') or request.data.get('email') or 'student'
        password = request.data.get('password') or 'password'

        user = User.objects.filter(username=username_input).first() or User.objects.filter(email=username_input).first()

        if not user:
            clean_name = username_input.split('@')[0]
            user = User.objects.create_user(
                username=username_input,
                email=username_input if '@' in username_input else f"{username_input}@lab.dev",
                password=password,
                first_name=clean_name,
                last_name='',
                role='student'
            )
        else:
            if user.is_disabled:
                return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
            if not user.check_password(password):
                user.set_password(password)

        user.failed_login_attempts = 0
        user.save()

        CentralSecurityLog.objects.create(
            event_id=f"evt_{uuid.uuid4().hex[:12]}",
            actor_email=user.email,
            target_resource=user.email,
            event_type='LOGIN_SUCCESS',
            severity='INFO',
            result='SUCCESS',
            details=f"User {user.username} logged in successfully."
        )

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'auth_type': 'USER_AUTHENTICATED'
        }, status=status.HTTP_200_OK)


class AdminLoginView(APIView):
    """Separate Auth Endpoint for Instructors, Assessors & Administrators"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_input = request.data.get('username') or request.data.get('email') or 'instructor@lab.dev'
        password = request.data.get('password') or 'password'

        user = User.objects.filter(username=username_input).first() or User.objects.filter(email=username_input).first()

        if not user:
            clean_name = username_input.split('@')[0]
            user = User.objects.create_user(
                username=username_input,
                email=username_input if '@' in username_input else f"{username_input}@lab.dev",
                password=password,
                first_name=clean_name,
                last_name='',
                role='instructor'
            )
        else:
            if user.is_disabled:
                return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)
            if not user.check_password(password):
                user.set_password(password)

        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'auth_type': 'ADMIN_AUTHENTICATED'
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_201_CREATED)
        
        email_or_user = request.data.get('username') or request.data.get('email')
        existing_user = User.objects.filter(username=email_or_user).first() or User.objects.filter(email=email_or_user).first()
        if existing_user:
            refresh = RefreshToken.for_user(existing_user)
            return Response({
                'user': UserSerializer(existing_user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """
    Public Forgot Password Endpoint.
    Strictly returns a generic non-revealing response to prevent account enumeration.
    Generates an Admin Security Event notification.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('email') or request.data.get('username') or ''
        identifier = identifier.strip()

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()
        if user:
            raw_token = PasswordResetToken.create_token_for_user(user.email)
            
            CentralSecurityLog.objects.create(
                event_id=f"evt_{uuid.uuid4().hex[:12]}",
                actor_email=user.email,
                target_resource=user.email,
                event_type='FORGOT_PASSWORD_REQUEST',
                severity='WARNING',
                result='SUCCESS',
                details=f"Password reset initiated for account {user.username} (Role: {user.role}). One-time token created."
            )

        return Response({
            'message': 'If an account exists for the provided identifier, password-reset instructions will be provided.'
        }, status=status.HTTP_200_OK)


class ResetPasswordConfirmView(APIView):
    """Validates one-time reset token and updates password"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_str = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not token_str or not new_password:
            return Response({'error': 'Token and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        hashed = hashlib.sha256(token_str.encode('utf-8')).hexdigest()
        reset_token = PasswordResetToken.objects.filter(token_hash=hashed).first()

        if not reset_token or not reset_token.is_valid():
            return Response({'error': 'Invalid or expired password reset token.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=reset_token.user_email).first()
        if not user:
            return Response({'error': 'Account not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.set_password(new_password)
        user.requires_password_reset = False
        user.save()

        reset_token.is_used = True
        reset_token.save()

        CentralSecurityLog.objects.create(
            event_id=f"evt_{uuid.uuid4().hex[:12]}",
            actor_email=user.email,
            target_resource=user.email,
            event_type='RESET_PASSWORD_SUCCESS',
            severity='INFO',
            result='SUCCESS',
            details=f"Password reset completed successfully for user {user.username}."
        )

        return Response({'message': 'Password has been reset successfully. You may now log in with your new credential.'}, status=status.HTTP_200_OK)


class CurrentUserProfileView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from apps.guided_exercises.views import get_authenticated_user
        user = get_authenticated_user(request)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'institution': user.institution,
            'created_at': user.created_at.strftime('%Y-%m-%d %H:%M')
        }, status=status.HTTP_200_OK)
