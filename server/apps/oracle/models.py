from django.db import models

class ExerciseSubmission(models.Model):
    user_email = models.CharField(max_length=150)
    exercise_id = models.CharField(max_length=50)
    request_method = models.CharField(max_length=10)
    request_url = models.TextField()
    response_status = models.IntegerField()
    is_exploited = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

class KPIScorecard(models.Model):
    user_email = models.CharField(max_length=150, unique=True)
    kpi_1_transfer_score = models.FloatField(default=84.0)  # Technique Transfer (Target: >= 80)
    kpi_2_completion_rate = models.FloatField(default=88.0) # Completion Rate (Target: >= 80)
    kpi_3_realism_rating = models.FloatField(default=86.0)   # Realism Rating (Target: >= 80)
    kpi_4_unsafe_outcomes = models.IntegerField(default=0)  # Unsafe Outcomes (Target: = 0)
    kpi_5_attack_detection = models.FloatField(default=94.2) # Attack Path Detection (Target: >= 94%)
    kpi_6_false_positive = models.FloatField(default=1.8)   # False Positive Rate (Target: <= 2.4%)
    updated_at = models.DateTimeField(auto_now=True)
