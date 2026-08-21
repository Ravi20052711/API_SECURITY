from django.db import models

class AssessmentEvaluation(models.Model):
    evaluation_id = models.CharField(max_length=64, unique=True)
    student_email = models.CharField(max_length=150)
    assessor_email = models.CharField(max_length=150, blank=True)
    target_api_name = models.CharField(max_length=150, default='Unfamiliar Target API (FinTech Gateway)')
    status = models.CharField(max_length=30, default='SUBMITTED') # SUBMITTED, UNDER_REVIEW, PASSED, FAILED, REASSESSMENT_REQUIRED
    score = models.IntegerField(default=0)
    technique_transfer_score = models.IntegerField(default=85) # KPI-1 (>= 80/100)
    exercise_completion_score = models.IntegerField(default=90) # KPI-2 (>= 80/100)
    realism_assessment_score = models.IntegerField(default=88) # KPI-3 (>= 80/100)
    unsafe_outcomes_count = models.IntegerField(default=0) # KPI-4 (= 0)
    attack_path_detection_rate = models.FloatField(default=95.0) # KPI-5
    false_positive_rate = models.FloatField(default=2.5) # KPI-6
    evidence_notes = models.TextField(blank=True)
    assessor_feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Assessment {self.evaluation_id} - {self.student_email} [{self.status}]"
