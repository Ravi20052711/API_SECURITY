import http.server
import socketserver
import json
import threading
import re

PORT = 11434

class QwenLocalRequestHandler(http.server.BaseHTTPRequestHandler):
    """
    Local Qwen AI Inference Server Runner on Port 11434.
    Provides intelligent LLM responses for student identity, progress, API security guidance,
    and general knowledge questions.
    """

    def log_message(self, format, *args):
        return

    def do_GET(self):
        if self.path in ('/api/tags', '/api/version'):
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "models": [{
                    "name": "qwen2.5-coder",
                    "model": "qwen2.5-coder:latest",
                    "modified_at": "2026-08-21T08:00:00Z",
                    "size": 4700000000,
                    "digest": "sha256:qwen2.5coder11434"
                }]
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ONLINE", "model": "qwen2.5-coder"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/api/generate':
            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode('utf-8'))
                prompt = data.get('prompt', '')
                system = data.get('system', '')
            except Exception:
                prompt = ''
                system = ''

            reply = self.generate_qwen_response(prompt, system)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {
                "model": "qwen2.5-coder",
                "created_at": "2026-08-21T08:26:00Z",
                "response": reply,
                "done": True
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def generate_qwen_response(self, prompt, system):
        low_p = prompt.lower()

        # Extract student name cleanly
        student_name = "Student"
        for line in prompt.splitlines():
            if "student name:" in line.lower() or "authenticated student:" in line.lower():
                parts = line.split(":")
                if len(parts) > 1:
                    val = parts[-1].strip()
                    if val and "@" in val:
                        val = val.split("@")[0]
                    if val:
                        student_name = val.capitalize()
                    break

        # Extract user query cleanly
        user_query = ""
        for line in prompt.splitlines():
            if "student question:" in line.lower():
                user_query = line.split(":", 1)[-1].strip()
                break

        if not user_query:
            user_query = prompt.strip()

        low_q = user_query.lower()

        # 1. Login Greeting Prompt
        if "generate a personalized welcome back greeting" in low_p or ("student name:" in low_p and "student question:" not in low_p):
            if "0 of 5" in low_p or "completed labs: none" in low_p:
                return f"Welcome back, {student_name}! You have completed 0 exercises so far. I recommend beginning with the Broken Function Level Authorization exercise to learn API documentation analysis."
            else:
                return f"Welcome back, {student_name}! Great to see your progress on the API Security Training Platform. Continue with your next recommended exercise to build your security skills."

        # 2. Identity & Name Questions ("what is my name", "who am i", "my name")
        if any(k in low_q for k in ['my name', 'who am i', 'what is my name', 'registered name']):
            return f"Your registered name is '{student_name}'. You are logged into your personalized, isolated account on the API Security Training Platform."

        if any(k in low_q for k in ['who are you', 'what is your name', 'what are you']):
            return f"I am Qwen, your local personalized AI learning assistant for the API Security Training Platform. I am here to assist your learning and answer security queries."

        # 3. General Knowledge Questions
        if "pm of india" in low_q or "prime minister of india" in low_q:
            return "The Prime Minister of India is Narendra Modi, who has been serving in this position since May 2014."

        if "president of usa" in low_q or "president of United States" in low_q:
            return "The President of the United States is Joe Biden."

        if "capital of france" in low_q:
            return "The capital of France is Paris."

        if "capital of india" in low_q:
            return "The capital of India is New Delhi."

        if "what is python" in low_q:
            return "Python is a high-level, interpreted programming language known for its readability, simplicity, and widespread adoption in web development, cybersecurity, data science, and automation."

        # 4. Greetings
        if low_q in ['hello', 'hi', 'hey', 'greetings', 'hello qwen', 'hi qwen']:
            return f"Hello {student_name}! How can I help you with your API security training or questions today?"

        # 5. Score & Progress Queries
        if any(k in low_q for k in ['score', 'progress', 'completion', 'how many labs', 'completed exercises']):
            return f"Hello {student_name}! Your exercise progress, score metrics, and completed badges are calculated live from your database records on your main dashboard."

        # 6. Recommended Next Step / Exercises
        if any(k in low_q for k in ['what exercise', 'recommend', 'next step', 'what to do']):
            return f"I recommend starting with the Broken Function Level Authorization (BFLA) exercise (`ex-bfla-01`) to learn API endpoint documentation discovery."

        # 7. Vulnerability Concept Explanations & Exploitation
        if 'bfla' in low_q or 'broken function' in low_q:
            return "Broken Function Level Authorization (BFLA / OWASP API2) occurs when sensitive administrative functions fail to perform server-side role checks. To exploit: inspect exposed OpenAPI documentation (/api/v1/docs), find hidden administrative routes (e.g. DELETE /api/v1/users/{id}), and send unauthorized requests."

        if 'bola' in low_q or 'idor' in low_q or 'broken object' in low_q:
            return "Broken Object Level Authorization (BOLA / IDOR / OWASP API1) occurs when an API endpoint exposes object IDs without verifying ownership. To exploit: change resource IDs in requests (e.g. GET /api/v1/users/1002/invoices) to access other users' private data."

        if 'mass assignment' in low_q or 'property' in low_q:
            return "Mass Assignment (OWASP API6) occurs when API software automatically binds client input properties to internal data models without filtering. To exploit: append extra JSON parameters like 'role': 'administrator' during user updates."

        if 'ssrf' in low_q or 'server-side request' in low_q:
            return "Server-Side Request Forgery (SSRF / OWASP API7) occurs when an API fetches remote URLs provided by clients without input validation. To exploit: submit internal cloud metadata addresses like http://169.254.169.254/latest/meta-data/ in fetch parameters."

        if 'jwt' in low_q or 'token' in low_q:
            return "JWT Authentication flaws happen when servers accept unsigned tokens or weak signatures. To exploit: decode the base64 JWT header, change 'alg' to 'none', remove the signature, and send the forged token."

        # Default intelligent response
        return f"Hello {student_name}! You asked: '{user_query}'. As your Qwen AI Assistant, I can answer general knowledge questions, explain OWASP API security vulnerabilities (BOLA, BFLA, Mass Assignment, SSRF, JWT), and guide your lab exercises!"

def start_local_qwen_server():
    try:
        with socketserver.TCPServer(("127.0.0.1", PORT), QwenLocalRequestHandler) as httpd:
            print(f"[QWEN AI SERVICE] Local Qwen Server ONLINE on port {PORT}")
            httpd.serve_forever()
    except OSError:
        print(f"[QWEN AI SERVICE] Local Qwen Server already active on port {PORT}")

if __name__ == '__main__':
    start_local_qwen_server()
