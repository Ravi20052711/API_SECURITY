from django.db import models

class InstructorAssignment(models.Model):
    instructor_email = models.CharField(max_length=150)
    student_email = models.CharField(max_length=150)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('instructor_email', 'student_email')

    def __str__(self):
        return f"Instructor {self.instructor_email} -> Student {self.student_email}"
