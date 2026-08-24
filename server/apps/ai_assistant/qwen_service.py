import os
import json
import urllib.request
import logging

logger = logging.getLogger(__name__)

class QwenAIService:
    """
    Real Local Ollama AI Assistant Service.
    Connects to local Ollama LLM engine (http://127.0.0.1:11434/api/generate or /api/chat).
    Reads active user progress and entire frontend workbench page context.
    """

    OLLAMA_GENERATE_URL = os.environ.get('LOCAL_QWEN_URL', 'http://127.0.0.1:11434/api/generate')
    OLLAMA_CHAT_URL = 'http://127.0.0.1:11434/api/chat'
    OLLAMA_TAGS_URL = 'http://127.0.0.1:11434/api/tags'

    PREFERRED_MODELS = [
        'qwen2.5-coder', 'qwen2.5-coder:latest', 'qwen2.5', 'qwen2.5:latest',
        'qwen2.5:0.5b', 'qwen2.5:1.5b', 'qwen2.5:7b', 'qwen:latest', 'qwen',
        'llama3.2', 'llama3', 'mistral', 'gemma', 'codellama'
    ]

    @classmethod
    def determine_experience_level(cls, progress_stats):
        completed = progress_stats.get('completed_count', 0)
        score = progress_stats.get('total_score', 0)

        if completed >= 4 or score >= 400:
            return {
                'tier': 'EXPERT_HACKER',
                'title': 'Expert API Security Specialist',
                'badge': '🔥 Expert API Hacker',
                'style': 'Concise, high-level tactical pointers and advanced payload bypass steps.'
            }
        elif completed >= 2 or score >= 200:
            return {
                'tier': 'PRACTITIONER',
                'title': 'Intermediate Security Practitioner',
                'badge': '⚡ Practitioner',
                'style': 'Technical step-by-step lab advisor focusing on payload construction and parameters.'
            }
        else:
            return {
                'tier': 'APPRENTICE',
                'title': 'Beginner Apprentice',
                'badge': '🌱 Apprentice',
                'style': 'Supportive step-by-step mentor giving explicit Step 1, Step 2, Step 3 instructions.'
            }

    @classmethod
    def get_active_model(cls):
        try:
            req = urllib.request.Request(cls.OLLAMA_TAGS_URL, method='GET')
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                installed_models = [m.get('name') for m in data.get('models', [])]
                logger.info(f"Ollama installed models: {installed_models}")

                for target in cls.PREFERRED_MODELS:
                    if target in installed_models:
                        return target
                    for m in installed_models:
                        if target in m:
                            return m

                if installed_models:
                    return installed_models[0]
        except Exception as e:
            logger.warning(f"Ollama tags lookup notice: {e}")

        return 'qwen2.5-coder'

    @classmethod
    def is_qwen_available(cls):
        try:
            req = urllib.request.Request(cls.OLLAMA_TAGS_URL, method='GET')
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                return resp.status == 200
        except Exception:
            return False

    @classmethod
    def _call_ollama(cls, prompt, system_prompt=None):
        model_name = cls.get_active_model()

        payload = {
            "model": model_name,
            "prompt": prompt,
            "system": system_prompt or "",
            "stream": False,
            "options": {
                "temperature": 0.6,
                "num_predict": 400
            }
        }

        try:
            req = urllib.request.Request(
                cls.OLLAMA_GENERATE_URL,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=60.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                res_text = data.get('response', '').strip()
                if res_text:
                    return res_text
        except Exception as e:
            logger.warning(f"Ollama LLM inference error: {e}")

        return None

    @classmethod
    def generate_greeting(cls, user_name, user_email, progress_stats, items):
        exp = cls.determine_experience_level(progress_stats)
        not_started = [i for i in items if i['status'] == 'NOT_STARTED']
        in_prog = [i for i in items if i['status'] == 'IN_PROGRESS']
        next_rec = not_started[0]['title'] if not_started else (in_prog[0]['title'] if in_prog else "OWASP API Assessment")

        system_prompt = (
            "You are Qwen AI, a friendly and expert API security tutor on HackTheAPI platform.\n"
            f"Greet the student {user_name} ({exp['badge']}). Encourage them for their next lab: {next_rec}. Keep it under 2 sentences."
        )

        resp = cls._call_ollama(f"Greet student {user_name}.", system_prompt=system_prompt)
        if resp:
            return resp

        return f"Welcome back, {user_name}! ({exp['badge']}). You have completed {progress_stats['completed_count']} of {progress_stats['total_exercises']} exercises. Next recommended lab: {next_rec}."

    @classmethod
    def generate_learning_advice(cls, user_name, user_query, progress_stats, items, active_lab=None, page_context=None):
        exp = cls.determine_experience_level(progress_stats)
        completed_labs = [i['title'] for i in items if i['status'] == 'COMPLETED']
        pending_labs = [i['title'] for i in items if i['status'] != 'COMPLETED']

        context_lines = []
        context_lines.append(f"STUDENT ACCOUNT & INTERNAL PROGRESS:")
        context_lines.append(f"- Student Name: {user_name}")
        context_lines.append(f"- Experience Tier: {exp['title']} ({exp['badge']})")
        context_lines.append(f"- Completed Labs Count: {progress_stats['completed_count']} / {progress_stats['total_exercises']} ({progress_stats['completion_rate']}%)")
        context_lines.append(f"- Total Score: {progress_stats['total_score']} pts")

        if completed_labs:
            context_lines.append(f"- Completed Labs: {', '.join(completed_labs)}")
        if pending_labs:
            context_lines.append(f"- Next Pending Labs: {', '.join(pending_labs[:5])}")

        if active_lab and isinstance(active_lab, dict):
            context_lines.append(f"- Running Session Lab: {active_lab.get('title')} (ID: {active_lab.get('exercise_id')})")

        # Entire Screen / Page Workbench Context
        if page_context and isinstance(page_context, dict):
            context_lines.append("\nENTIRE FRONTEND PAGE & WORKBENCH CONTEXT (CURRENTLY OPEN ON USER SCREEN):")
            if page_context.get('url'):
                context_lines.append(f"- Page Route: {page_context['url']}")
            if page_context.get('exercise_id'):
                context_lines.append(f"- Exercise ID: {page_context['exercise_id']}")
            if page_context.get('lab_title'):
                context_lines.append(f"- Exercise Title: {page_context['lab_title']}")
            if page_context.get('owasp'):
                context_lines.append(f"- OWASP Vulnerability Category: {page_context['owasp']}")
            if page_context.get('scenario'):
                context_lines.append(f"- Scenario & Problem Description: {page_context['scenario']}")
            if page_context.get('objective'):
                context_lines.append(f"- Lab Objective: {page_context['objective']}")
            if page_context.get('request_method'):
                context_lines.append(f"- Request Builder Method: {page_context['request_method']}")
            if page_context.get('request_endpoint'):
                context_lines.append(f"- Request Builder Endpoint: {page_context['request_endpoint']}")
            if page_context.get('request_headers'):
                context_lines.append(f"- Request Builder Headers: {page_context['request_headers']}")
            if page_context.get('request_body'):
                context_lines.append(f"- Request Builder Body: {page_context['request_body']}")
            if page_context.get('last_response_status'):
                context_lines.append(f"- Last Execution Status Code: {page_context['last_response_status']}")
            if page_context.get('last_response_output'):
                context_lines.append(f"- Last Execution Response Output: {str(page_context['last_response_output'])[:400]}")

        system_prompt = f"""You are Qwen AI, an intelligent, versatile AI Assistant integrated into HackTheAPI Cybersecurity Platform.

{"\n".join(context_lines)}

SYSTEM & RESPONSE GUIDELINES:
1. For general knowledge, geography, anime, science, coding, or general questions (e.g., "where is Germany", "what is python", "hello"), answer accurately, naturally, and conversationally using your full LLM knowledge.
2. When the user asks "guide me through this", "help me with this lab", or asks about their current lab exercise, inspect the ENTIRE FRONTEND PAGE & WORKBENCH CONTEXT above and provide tailored, step-by-step guidance explaining what parameters to modify and how to achieve the lab objective.
3. Be encouraging, precise, and concise. Do NOT echo prompt templates or system strings. Speak directly to {user_name}."""

        resp = cls._call_ollama(user_query, system_prompt=system_prompt)
        if resp:
            return resp

        return f"⚠️ Local Ollama AI is currently offline. Please start Ollama on your computer (`ollama run qwen2.5-coder`) to connect your local AI engine."
