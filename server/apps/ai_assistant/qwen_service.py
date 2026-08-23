import os
import json
import urllib.request
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

PLATFORM_KNOWLEDGE_SYSTEM = """
PLATFORM CONTEXT & LAB KNOWLEDGE SYSTEM (AUTHORITATIVE):

Website & Application Identity:
- Name: API Security Training Platform (HackTheAPI)
- Purpose: Hands-on, isolated cybersecurity training platform that teaches OWASP Top 10 API Security vulnerabilities using Docker-provisioned target containers.

EXPLICIT STEP-BY-STEP LAB INSTRUCTIONS:

1. Lab: Broken Function Level Authorization (BFLA - OWASP API2:2023) [ex-bfla-01]:
   - Step 1: Open the Request Builder or browse http://localhost:8102/api/v1/docs to inspect exposed OpenAPI documentation.
   - Step 2: Locate the administrative user deletion endpoint: DELETE /api/v1/users/{username}.
   - Step 3: In Request Builder, set Method to DELETE, endpoint to /api/v1/users/carlos, and click Send Request.
   - Step 4: Verify 200 OK response and click Validate Lab.

2. Lab: Broken Object Level Authorization (BOLA / IDOR - OWASP API1:2023) [ex-bola-01]:
   - Step 1: Open Request Builder or browse http://localhost:8101/api/v1/users/me.
   - Step 2: Identify target user Carlos's ID (1002).
   - Step 3: In Request Builder, set Method to GET, endpoint to /api/v1/users/1002/invoices, and click Send Request.
   - Step 4: View Carlos's private invoice data and click Validate Lab.

3. Lab: Mass Assignment / Property Authorization Bypass (OWASP API3:2023) [ex-mass-01]:
   - Step 1: Set Method to PATCH, endpoint to /api/v1/users/me.
   - Step 2: In JSON Body, inject property: {"email": "wiener@normal-user.net", "role": "administrator"}.
   - Step 3: Click Send Request to elevate profile to administrator.
   - Step 4: Click Validate Lab.

4. Lab: Server-Side Request Forgery (SSRF - OWASP API7:2023) [ex-ssrf-01]:
   - Step 1: Set Method to POST, endpoint to /api/v1/fetch-avatar.
   - Step 2: Set JSON Body to: {"url": "http://169.254.169.254/latest/meta-data/iam/security-credentials"}.
   - Step 3: Click Send Request to extract internal cloud metadata.
   - Step 4: Click Validate Lab.
"""

class QwenAIService:
    """
    Personalized Local Qwen AI Assistant Service.
    Connects to local Ollama Qwen LLM engine (http://127.0.0.1:11434/api/generate).
    Provides general knowledge and specialized cybersecurity lab assistance.
    """

    QWEN_URL = os.environ.get('LOCAL_QWEN_URL', 'http://127.0.0.1:11434/api/generate')
    DEFAULT_MODELS = ['qwen:latest', 'qwen:4b', 'qwen3.5:4b', 'qwen3.5:cloud', 'qwen2.5-coder']

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
            req = urllib.request.Request("http://127.0.0.1:11434/api/tags", method='GET')
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                installed = [m.get('name') for m in data.get('models', [])]
                for target in cls.DEFAULT_MODELS:
                    if target in installed:
                        return target
                if installed:
                    return installed[0]
        except Exception:
            pass
        return 'qwen:latest'

    @classmethod
    def is_qwen_available(cls):
        try:
            req = urllib.request.Request("http://127.0.0.1:11434/api/tags", method='GET')
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                return resp.status == 200
        except Exception:
            return False

    @classmethod
    def _call_qwen(cls, prompt, system_prompt=None):
        model_name = cls.get_active_model()
        full_system_prompt = f"{PLATFORM_KNOWLEDGE_SYSTEM}\n\n{system_prompt or ''}".strip()

        payload = {
            "model": model_name,
            "prompt": prompt,
            "system": full_system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.5,
                "num_predict": 300
            }
        }

        try:
            req = urllib.request.Request(
                cls.QWEN_URL,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=45.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                res_text = data.get('response', '').strip()
                if res_text:
                    return res_text
        except Exception as e:
            logger.warning(f"Ollama local Qwen inference notice: {e}")

        return None

    @classmethod
    def generate_greeting(cls, user_name, user_email, progress_stats, items):
        exp = cls.determine_experience_level(progress_stats)
        not_started = [i for i in items if i['status'] == 'NOT_STARTED']
        in_prog = [i for i in items if i['status'] == 'IN_PROGRESS']
        next_rec = not_started[0]['title'] if not_started else (in_prog[0]['title'] if in_prog else "Unfamiliar API Assessment")

        system_prompt = (
            "You are Qwen, a friendly and intelligent AI Learning Assistant on HackTheAPI.\n"
            f"Greet student {user_name} warmly and encourage them for their next lab: {next_rec}."
        )

        resp = cls._call_qwen(f"Greet student {user_name}.", system_prompt=system_prompt)
        if resp:
            return resp

        return f"Welcome back, {user_name}! ({exp['badge']}). You have completed {progress_stats['completed_count']} of {progress_stats['total_exercises']} exercises. Your next recommended exercise is {next_rec}."

    @classmethod
    def generate_learning_advice(cls, user_name, user_query, progress_stats, items, active_lab=None):
        exp = cls.determine_experience_level(progress_stats)
        not_started = [i for i in items if i['status'] == 'NOT_STARTED']
        in_prog = [i for i in items if i['status'] == 'IN_PROGRESS']

        current_target = active_lab if active_lab else (in_prog[0] if in_prog else (not_started[0] if not_started else None))
        current_title = current_target.get('title', 'BFLA Lab') if current_target else 'BFLA Lab'
        current_ex_id = current_target.get('exercise_id', 'ex-bfla-01') if current_target else 'ex-bfla-01'

        system_prompt = (
            "You are Qwen, a versatile, highly intelligent AI assistant with full general knowledge and cybersecurity expertise.\n"
            f"You are chatting with student {user_name} on HackTheAPI (Current Active Lab: {current_title}).\n\n"
            "RESPONSE GUIDELINES:\n"
            "- If the student asks a general knowledge, anime, science, coding, or casual question (e.g., 'bankai', 'what is python', 'hi'), answer accurately, naturally, and conversationally using your general knowledge.\n"
            "- If the student asks about API security, OWASP, or how to solve their lab, provide clear, step-by-step technical guidance.\n"
            "- DO NOT echo prompt templates or system strings."
        )

        resp = cls._call_qwen(user_query, system_prompt=system_prompt)
        if resp:
            cleaned = resp
            if "Student Name:" in cleaned and "Question:" in cleaned:
                cleaned = cleaned.split("Provide your AI response.")[-1].strip()
            return cleaned

        return (
            f"Here is your step-by-step guide for **{current_title}**:\n"
            "1. Open the **Request Builder** tab to construct your HTTP request.\n"
            "2. Inspect API documentation at `/api/v1/docs` to discover exposed endpoints.\n"
            "3. Send the modified HTTP request to test authorization boundaries.\n"
            "4. Click **Validate Lab** to record your completion!"
        )
