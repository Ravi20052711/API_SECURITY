from django.db import models

class Cohort(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, default='COH-001')
    description = models.TextField(blank=True)
    students_count = models.IntegerField(default=0)
    active_exercise_set = models.CharField(max_length=100, default='OWASP API Top 10 Baseline')
    deployed_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

class ContainerFixture(models.Model):
    fixture_id = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    owasp_category = models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    port = models.IntegerField(default=8000)
    last_health_check = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.fixture_id} - {self.name}"

class GuardrailTestRun(models.Model):
    test_code = models.CharField(max_length=20)
    name = models.CharField(max_length=150)
    expected_behavior = models.TextField(blank=True)
    recovery_time = models.CharField(max_length=20, default='0.12s')
    status = models.CharField(max_length=20, default='PASS')
    last_run_at = models.DateTimeField(auto_now=True)
    logs = models.TextField(blank=True)

    def __str__(self):
        return f"{self.test_code}: {self.name} [{self.status}]"

class ValidationQueueItem(models.Model):
    submission_id = models.CharField(max_length=50)
    student_name = models.CharField(max_length=100)
    exercise_name = models.CharField(max_length=150)
    request_payload = models.TextField(blank=True)
    response_status = models.IntegerField(default=200)
    status = models.CharField(max_length=20, default='Pending Review')
    reviewed_by = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.submission_id} - {self.student_name} ({self.status})"

class AdminAuditLog(models.Model):
    admin_email = models.CharField(max_length=150)
    target_user_email = models.CharField(max_length=150)
    action = models.CharField(max_length=50)
    details = models.TextField(blank=True)
    affected_session = models.CharField(max_length=100, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.action}] {self.admin_email} -> {self.target_user_email} at {self.timestamp}"
