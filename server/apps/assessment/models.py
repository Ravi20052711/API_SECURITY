from django.db import models
from django.utils import timezone

class Assessment(models.Model):
    TYPES = [
        ('PRE', 'Pre-Test Assessment'),
        ('POST', 'Post-Test Assessment'),
        ('TRANSFER', 'Transfer Assessment'),
        ('USABILITY', 'Usability Assessment (SUS)')
    ]
    title = models.CharField(max_length=255)
    assessment_type = models.CharField(max_length=20, choices=TYPES, unique=True)
    version = models.CharField(max_length=20, default='v1.0')
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_assessment_type_display()} ({self.version})"

class AssessmentQuestion(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_code = models.CharField(max_length=50)
    category = models.CharField(max_length=100)
    text = models.TextField()
    option_a = models.TextField()
    option_b = models.TextField()
    option_c = models.TextField()
    option_d = models.TextField()
    correct_option = models.CharField(max_length=1)
    explanation = models.TextField(blank=True)

    def __str__(self):
        return f"[{self.assessment.assessment_type}] {self.question_code} - {self.category}"

class AssessmentAttempt(models.Model):
    STATUS_CHOICES = [
        ('NOT_STARTED', 'Not Started'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed')
    ]
    participant_email = models.CharField(max_length=255, db_index=True)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    assessment_type = models.CharField(max_length=20)
    question_set_version = models.CharField(max_length=20, default='v1.0')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_STARTED')
    score_percentage = models.FloatField(default=0.0)
    total_questions = models.IntegerField(default=0)
    correct_answers_count = models.IntegerField(default=0)
    start_time = models.DateTimeField(default=timezone.now)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.participant_email} - {self.assessment_type} ({self.status}) - {self.score_percentage}%"

class AssessmentAnswer(models.Model):
    attempt = models.ForeignKey(AssessmentAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1, blank=True)
    is_correct = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.attempt.participant_email} - {self.question.question_code}: Selected '{self.selected_option}'"

class KnowledgeGainSummary(models.Model):
    participant_email = models.CharField(max_length=255, unique=True)
    pre_test_score = models.FloatField(null=True, blank=True)
    post_test_score = models.FloatField(null=True, blank=True)
    absolute_gain = models.FloatField(null=True, blank=True)
    normalized_gain = models.FloatField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.participant_email} - Pre: {self.pre_test_score}% | Post: {self.post_test_score}%"
