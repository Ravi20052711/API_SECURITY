from django.db import models

class UserAIConversation(models.Model):
    """
    Strictly Isolated Per-User Qwen AI Conversation History.
    User A can only access and view User A's AI context.
    """
    user_email = models.CharField(max_length=255, db_index=True)
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant'), ('system', 'System')])
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.timestamp}] {self.user_email} ({self.role}): {self.message[:30]}..."
