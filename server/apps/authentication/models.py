from django.contrib.auth.models import AbstractUser
from django.db import models
import secrets
import hashlib
from django.utils import timezone
from datetime import timedelta

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('assessor', 'Assessor'),
        ('admin', 'Administrator'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    institution = models.CharField(max_length=255, blank=True)
    ethical_agreement_accepted = models.BooleanField(default=True)
    is_disabled = models.BooleanField(default=False)
    requires_password_reset = models.BooleanField(default=False)
    must_change_password = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class PasswordResetToken(models.Model):
    user_email = models.CharField(max_length=150)
    token_hash = models.CharField(max_length=128, unique=True)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    @classmethod
    def create_token_for_user(cls, user_email):
        raw_token = secrets.token_urlsafe(32)
        hashed = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        expires = timezone.now() + timedelta(hours=1)
        cls.objects.create(
            user_email=user_email,
            token_hash=hashed,
            expires_at=expires
        )
        return raw_token

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at


class RoleChangeEvent(models.Model):
    admin_email = models.CharField(max_length=150)
    target_user_email = models.CharField(max_length=150)
    old_role = models.CharField(max_length=50)
    new_role = models.CharField(max_length=50)
    reason = models.TextField(blank=True, default='Administrative Role Assignment')
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"RoleChange: {self.target_user_email} ({self.old_role} -> {self.new_role}) by {self.admin_email}"


class CentralSecurityLog(models.Model):
    event_id = models.CharField(max_length=64, unique=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    actor_email = models.CharField(max_length=150)
    target_resource = models.CharField(max_length=200, blank=True)
    event_type = models.CharField(max_length=100) # LOGIN_SUCCESS, LOGIN_FAILURE, FORGOT_PASSWORD, NULLIFY_PASSWORD, ROLE_CHANGE, PROGRESS_RESET
    severity = models.CharField(max_length=20, default='INFO') # INFO, WARNING, CRITICAL
    result = models.CharField(max_length=50, default='SUCCESS')
    details = models.TextField(blank=True)
    ip_address = models.CharField(max_length=50, blank=True, default='127.0.0.1')

    def __str__(self):
        return f"[{self.severity}] {self.event_type} by {self.actor_email} at {self.timestamp}"
