from django.db import models
import uuid

class ExerciseModule(models.Model):
    module_id = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    owasp_code = models.CharField(max_length=20)
    difficulty = models.CharField(max_length=20)
    estimated_time = models.CharField(max_length=20)
    scenario_description = models.TextField()
    learning_objective = models.TextField()

class HintLog(models.Model):
    user_email = models.CharField(max_length=150)
    module_id = models.CharField(max_length=50)
    hint_level = models.IntegerField(default=1)
    kpi_penalty = models.FloatField(default=10.0)
    timestamp = models.DateTimeField(auto_now_add=True)

class UserProgress(models.Model):
    user_email = models.CharField(max_length=150)
    exercise_id = models.CharField(max_length=50)
    exercise_title = models.CharField(max_length=200)
    status = models.CharField(max_length=30, default='NOT_STARTED') # COMPLETED, IN_PROGRESS, NOT_STARTED
    score = models.IntegerField(default=0)
    hints_used = models.IntegerField(default=0)
    time_spent = models.CharField(max_length=50, default='12m')
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user_email', 'exercise_id')

class UserLabSession(models.Model):
    """
    Per-user per-lab dynamic container session model.
    Tracks session ID, user email, exercise ID, dedicated container name, 
    assigned dynamic host port, session security token, 20-minute backend timer, pause state, and test execution status.
    """
    session_id = models.CharField(max_length=100, unique=True, primary_key=True)
    user_email = models.CharField(max_length=150)
    exercise_id = models.CharField(max_length=50)
    container_name = models.CharField(max_length=150)
    assigned_port = models.IntegerField()
    session_token = models.CharField(max_length=100)
    status = models.CharField(max_length=30, default='RUNNING') # RUNNING, COMPLETED, EXITED, EXPIRED, FAILED
    test_results = models.TextField(default='[]')
    
    expires_at = models.DateTimeField(null=True, blank=True)
    is_paused = models.BooleanField(default=False)
    paused_at = models.DateTimeField(null=True, blank=True)
    accumulated_paused_seconds = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

class UserExerciseAttempt(models.Model):
    user_email = models.CharField(max_length=150)
    exercise_id = models.CharField(max_length=50)
    status = models.CharField(max_length=30, default='SUBMITTED') # PASSED, FAILED, SUBMITTED
    score = models.IntegerField(default=0)
    request_payload = models.TextField(blank=True)
    evidence_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attempt {self.user_email} - {self.exercise_id} [{self.status}]"
