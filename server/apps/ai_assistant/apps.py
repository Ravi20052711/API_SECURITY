from django.apps import AppConfig

class AIAssistantConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai_assistant'

    def ready(self):
        """
        AIAssistant App Initializer.
        Directly integrates with local Ollama service running on port 11434.
        """
        pass
