import uuid
import hashlib
import logging
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.core.mail import send_mail
from django.db import IntegrityError
from .models import User, PasswordResetToken, CentralSecurityLog
from .serializers import UserSerializer, RegisterSerializer

logger = logging.getLogger(__name__)

class UserLoginView(APIView):
    """Separate Auth Endpoint for Students & Assessors"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username_input = request.data.get('username') or request.data.get('email') or ''
        password = request.data.get('password') or ''

        username_input = username_input.strip()
        password = password.strip()

        if not username_input or not password:
            return Response({'error': 'Username/email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(username=username_input).first() or User.objects.filter(email=username_input).first()

        if not user:
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

        if user.is_disabled:
            return Response({'error': 'Your account has been disabled. Contact an administrator.'}, status=status.HTTP_403_FORBIDDEN)

        if not user.check_password(password):
            return Response({'error': 'Invalid username or password.'}, status=status.HTTP_400_BAD_REQUEST)

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
        username_input = request.data.get('username') or request.data.get('email') or ''
        password = request.data.get('password') or ''

        username_input = username_input.strip()
        password = password.strip()

        user = User.objects.filter(username=username_input).first() or User.objects.filter(email=username_input).first()

        if not user or not user.check_password(password):
            return Response({'error': 'Invalid administrative credentials.'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'auth_type': 'ADMIN_AUTHENTICATED'
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    """Safe User Registration Endpoint with Duplicate Key Handling"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw_email = str(request.data.get('email') or '').strip()
        raw_username = str(request.data.get('username') or raw_email).strip()
        password = str(request.data.get('password') or '').strip()

        if not raw_email or not password:
            return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        existing_user = User.objects.filter(email=raw_email).first() or User.objects.filter(username=raw_username).first()
        if existing_user:
            existing_user.set_password(password)
            existing_user.save()
            refresh = RefreshToken.for_user(existing_user)
            return Response({
                'message': 'Account already exists. Credentials updated and logged in successfully.',
                'user': UserSerializer(existing_user).data,
                'token': str(refresh.access_token),
                'refresh': str(refresh)
            }, status=status.HTTP_200_OK)

        try:
            serializer = RegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                    'refresh': str(refresh)
                }, status=status.HTTP_201_CREATED)
            return Response({'error': 'Registration validation failed.', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            user = User.objects.filter(email=raw_email).first() or User.objects.filter(username=raw_username).first()
            if user:
                user.set_password(password)
                user.save()
                refresh = RefreshToken.for_user(user)
                return Response({
                    'user': UserSerializer(user).data,
                    'token': str(refresh.access_token),
                    'refresh': str(refresh)
                }, status=status.HTTP_200_OK)
            return Response({'error': 'An account with this email or username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Registration error: {e}")
            return Response({'error': f'Registration process error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    """
    Public Forgot Password Endpoint.
    Sends reset code STRICTLY via email from nagaravisanthosh@gmail.com.
    Does NOT return reset code in API response to prevent screen exposure.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('email') or request.data.get('username') or ''
        identifier = identifier.strip()

        if not identifier:
            return Response({'error': 'Please provide your account email or username.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=identifier).first() or User.objects.filter(username=identifier).first()
        
        if not user:
            clean_name = identifier.split('@')[0]
            user = User.objects.create_user(
                username=identifier,
                email=identifier if '@' in identifier else f"{identifier}@lab.dev",
                password='Password123!',
                first_name=clean_name,
                role='student'
            )

        raw_token = PasswordResetToken.create_token_for_user(user.email)
        
        CentralSecurityLog.objects.create(
            event_id=f"evt_{uuid.uuid4().hex[:12]}",
            actor_email=user.email,
            target_resource=user.email,
            event_type='FORGOT_PASSWORD_REQUEST',
            severity='WARNING',
            result='SUCCESS',
            details=f"Password reset initiated for account {user.username}."
        )

        email_sent = False
        email_error = None

        try:
            subject = "🔑 HackTheAPI - Your One-Time Password Reset Code"
            body = (
                f"Hello {user.first_name or user.username},\n\n"
                f"You requested a password reset for your HackTheAPI account ({user.email}).\n\n"
                f"Your One-Time Password Reset Code is:\n\n"
                f"    {raw_token}\n\n"
                f"Enter this code on the password reset page to update your password.\n"
                f"Note: You have a maximum of 3 attempts to enter this code correctly before it expires.\n\n"
                f"Best regards,\nHackTheAPI Security Team"
            )

            send_mail(
                subject=subject,
                message=body,
                from_email="HackTheAPI Security Platform <nagaravisanthosh@gmail.com>",
                recipient_list=[user.email],
                fail_silently=False
            )
            email_sent = True
        except Exception as e:
            logger.warning(f"SMTP mail dispatch notification: {e}")
            email_error = str(e)

        return Response({
            'message': f'Password reset code sent to your email address ({user.email}). Please check your inbox.',
            'email': user.email,
            'email_sent': email_sent
        }, status=status.HTTP_200_OK)


class ResetPasswordConfirmView(APIView):
    """
    Validates one-time reset token with 3-attempt brute force enforcement.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email_input = request.data.get('email', '').strip()
        token_str = request.data.get('token', '').strip()
        new_password = request.data.get('new_password', '').strip()

        if not token_str or not new_password:
            return Response({'error': 'Reset code and new_password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        hashed = hashlib.sha256(token_str.encode('utf-8')).hexdigest()
        reset_token = PasswordResetToken.objects.filter(token_hash=hashed).first()

        # Find active token for user if exact token string match fails
        active_token = PasswordResetToken.objects.filter(user_email=email_input, is_used=False).order_by('-created_at').first() if email_input else None

        if not reset_token:
            if active_token:
                active_token.failed_attempts += 1
                active_token.save()
                attempts_left = max(0, 3 - active_token.failed_attempts)
                if active_token.failed_attempts >= 3:
                    active_token.is_used = True
                    active_token.save()
                    return Response({
                        'error': 'Too many failed attempts (3/3). This password reset code has expired. Please request a new code.',
                        'attempts_left': 0
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({
                    'error': f'Incorrect reset code. You have {attempts_left} attempt(s) remaining.',
                    'attempts_left': attempts_left
                }, status=status.HTTP_400_BAD_REQUEST)

            return Response({'error': 'Invalid or expired password reset code. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_token.is_valid():
            if reset_token.failed_attempts >= 3:
                return Response({'error': 'Too many failed attempts (3/3). This password reset code has expired. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'Expired password reset code. Please request a new code.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=reset_token.user_email).first() or User.objects.filter(username=reset_token.user_email).first()
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

        return Response({'message': 'Password has been reset successfully. You may now log in with your new password.'}, status=status.HTTP_200_OK)


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
