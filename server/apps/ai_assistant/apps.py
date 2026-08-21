import threading
import time
from django.apps import AppConfig

class AIAssistantConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ai_assistant'

    def ready(self):
        """
        AUTOMATIC QWEN AI ONLINE ENFORCER:
        Ensures local Qwen AI service is started and ONLINE every time the project starts.
        """
        def auto_start_qwen():
            try:
                from .qwen_local_runner import start_local_qwen_server
                start_local_qwen_server()
            except Exception as e:
                pass

        # Start Qwen local server daemon thread
        t = threading.Thread(target=auto_start_qwen, daemon=True)
        t.start()
