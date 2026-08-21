import json
import sys
import os
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler

class DynamicVulnerableAPIServer(BaseHTTPRequestHandler):
    """
    Dynamic Deliberately Vulnerable Target Application Server running inside isolated per-user Docker container.
    Dynamically loads vulnerability behavior, endpoints, and server-side verification state
    based on the selected lab_id.
    """

    session_id = "sess_demo"
    session_token = "tok_demo"
    port = 8101
    exercise_id = "ex-bfla-01"

    # Container State Storage
    users_db = {
        "wiener": {
            "userId": 1001,
            "username": "wiener",
            "email": "wiener@normal-user.net",
            "role": "user",
            "status": "active"
        },
        "carlos": {
            "userId": 1002,
            "username": "carlos",
            "email": "carlos@target-user.net",
            "role": "user",
            "status": "active"
        }
    }
    
    # Challenge State Trackers
    carlos_deleted = False
    bola_accessed = False
    role_elevated = False
    ssrf_exfiltrated = False
    jwt_bypassed = False

    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # 1. API Documentation Endpoints
        if path in ['/api/v1/openapi.json', '/api/v1/swagger.json']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            spec = {
                "openapi": "3.0.0",
                "info": {"title": f"Target API Spec - {DynamicVulnerableAPIServer.exercise_id}", "version": "1.0.0"},
                "paths": {
                    "/api/v1/users/{username}": {
                        "get": {"summary": "Get User Profile"},
                        "delete": {"summary": "Delete User Account (Unprotected)"}
                    },
                    "/api/v1/users/1002/invoices": {"get": {"summary": "Get Invoice Records for User 1002"}},
                    "/api/v1/users/me": {"patch": {"summary": "Update Profile Parameters"}},
                    "/api/v1/fetch-avatar": {"post": {"summary": "Fetch Avatar Image URL"}}
                }
            }
            self.wfile.write(json.dumps(spec, indent=2).encode('utf-8'))
            return

        if path in ['/api/v1/docs', '/docs']:
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self._send_cors_headers()
            self.end_headers()
            docs_html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Target API Docs - {DynamicVulnerableAPIServer.exercise_id}</title>
    <style>
        body {{ font-family: monospace; background: #0f172a; color: #f8fafc; padding: 24px; }}
        .endpoint {{ background: #1e293b; border: 1px solid #334155; padding: 16px; margin-bottom: 16px; border-radius: 8px; }}
        .method {{ padding: 4px 8px; border-radius: 4px; font-weight: bold; }}
        .get {{ background: #0284c7; color: white; }}
        .delete {{ background: #dc2626; color: white; }}
        .patch {{ background: #d97706; color: white; }}
        .post {{ background: #16a34a; color: white; }}
    </style>
</head>
<body>
    <h1 style="color: #ff9800;">Target API Interactive Documentation ({DynamicVulnerableAPIServer.exercise_id})</h1>
    <p>Exposed Endpoint Operations:</p>

    <div class="endpoint">
        <span class="method get">GET</span> <code>/api/v1/users/1002/invoices</code>
        <p>Retrieves user invoices (BOLA Challenge).</p>
    </div>

    <div class="endpoint">
        <span class="method delete">DELETE</span> <code>/api/v1/users/{{username}}</code>
        <p>Deletes specified user account (Documentation BFLA Challenge).</p>
    </div>

    <div class="endpoint">
        <span class="method patch">PATCH</span> <code>/api/v1/users/me</code>
        <p>Updates profile parameters (Mass Assignment Challenge).</p>
    </div>
</body>
</html>"""
            self.wfile.write(docs_html.encode('utf-8'))
            return

        # 2. BOLA Challenge Endpoint: GET /api/v1/users/1002/invoices or /api/v1/invoices/INV-888
        if 'invoices' in path or '1002' in path or 'INV-888' in path:
            DynamicVulnerableAPIServer.bola_accessed = True
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            payload = {
                "status": "UNAUTHORIZED_OBJECT_ACCESSED",
                "ownerId": 1002,
                "ownerUsername": "carlos",
                "invoiceId": "INV-888",
                "amount": "$42,500.00",
                "confidentialData": "CONFIDENTIAL_CORPORATE_FINANCIAL_RECORD_UNLOCKED",
                "objectiveCompleted": True
            }
            self.wfile.write(json.dumps(payload, indent=2).encode('utf-8'))
            return

        # 3. JWT Challenge Admin Endpoint: GET /api/v1/admin/flag
        if path == '/api/v1/admin/flag':
            auth_header = self.headers.get('Authorization', '')
            if 'none' in auth_header.lower() or 'carlos' in auth_header.lower() or 'bearer' in auth_header.lower():
                DynamicVulnerableAPIServer.jwt_bypassed = True
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "status": "SUCCESS",
                    "flag": "FLAG{JWT_NONE_ALG_BYPASS_SUCCESSFUL}",
                    "objectiveCompleted": True
                }).encode('utf-8'))
                return

        # 4. User Profile GET Endpoint
        if path.startswith('/api/v1/users/'):
            username = path.split('/')[-1]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()

            if username in self.users_db and not (username == 'carlos' and DynamicVulnerableAPIServer.carlos_deleted):
                self.wfile.write(json.dumps(self.users_db[username]).encode('utf-8'))
            else:
                self.send_response(404)
                self.wfile.write(json.dumps({"error": f"User '{username}' not found or deleted."}).encode('utf-8'))
            return

        # 5. SERVER-SIDE VERIFICATION ENDPOINT (/api/v1/internal/verify)
        if path == '/api/v1/internal/verify':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()

            ex = DynamicVulnerableAPIServer.exercise_id

            if ex == 'ex-bola-01':
                completed = DynamicVulnerableAPIServer.bola_accessed
            elif ex == 'ex-mass-01':
                completed = DynamicVulnerableAPIServer.role_elevated
            elif ex == 'ex-ssrf-01':
                completed = DynamicVulnerableAPIServer.ssrf_exfiltrated
            elif ex == 'ex-jwt-01':
                completed = DynamicVulnerableAPIServer.jwt_bypassed
            else:  # ex-bfla-01
                completed = DynamicVulnerableAPIServer.carlos_deleted

            self.wfile.write(json.dumps({
                "exerciseId": ex,
                "objectiveCompleted": completed,
                "state": {
                    "carlosDeleted": DynamicVulnerableAPIServer.carlos_deleted,
                    "bolaAccessed": DynamicVulnerableAPIServer.bola_accessed,
                    "roleElevated": DynamicVulnerableAPIServer.role_elevated,
                    "ssrfExfiltrated": DynamicVulnerableAPIServer.ssrf_exfiltrated,
                    "jwtBypassed": DynamicVulnerableAPIServer.jwt_bypassed
                },
                "message": f"Server-Side Verification check for {ex}: {'PASSED' if completed else 'IN_PROGRESS'}"
            }).encode('utf-8'))
            return

        # Default Target Landing
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({
            "targetApp": "PortSwigger Dynamic Vulnerable Application API",
            "exerciseId": DynamicVulnerableAPIServer.exercise_id,
            "authenticatedUser": "wiener",
            "docsUrl": f"http://localhost:{DynamicVulnerableAPIServer.port}/api/v1/docs"
        }).encode('utf-8'))

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(length) if length > 0 else b''

        # SSRF Challenge Endpoint: POST /api/v1/fetch-avatar
        if path == '/api/v1/fetch-avatar':
            try:
                data = json.loads(body_bytes.decode('utf-8'))
                url = data.get('url', '')
                if '169.254.169.254' in url or 'meta-data' in url or 'iam' in url:
                    DynamicVulnerableAPIServer.ssrf_exfiltrated = True
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self._send_cors_headers()
                    self.end_headers()
                    payload = {
                        "status": "SUCCESS",
                        "ssrfExploited": True,
                        "retrievedUrl": url,
                        "iamMetadata": {
                            "AccessKeyId": "ASIAIOSFODNN7EXAMPLE",
                            "SecretAccessKey": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
                            "Token": "IQoJb3JpZ2luX2VjEAAA..."
                        },
                        "objectiveCompleted": True
                    }
                    self.wfile.write(json.dumps(payload, indent=2).encode('utf-8'))
                    return
            except Exception:
                pass

        # Auth Login Endpoint
        if path == '/api/v1/auth/login':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "authenticated": True,
                "user": "wiener",
                "token": "token_wiener_access_granted_9941"
            }).encode('utf-8'))
            return

        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_PATCH(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get('Content-Length', 0))
        body_bytes = self.rfile.read(length) if length > 0 else b''

        # Mass Assignment Challenge Endpoint: PATCH /api/v1/users/me
        if path in ['/api/v1/users/me', '/api/v1/users/wiener']:
            try:
                data = json.loads(body_bytes.decode('utf-8'))
                role = str(data.get('role', '')).lower()
                is_admin = data.get('is_admin', False) or data.get('admin', False)

                if role in ['administrator', 'admin'] or is_admin:
                    DynamicVulnerableAPIServer.role_elevated = True
                    DynamicVulnerableAPIServer.users_db['wiener']['role'] = 'administrator'
                    
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self._send_cors_headers()
                    self.end_headers()
                    payload = {
                        "status": "SUCCESS",
                        "action": "PROFILE_UPDATED",
                        "user": DynamicVulnerableAPIServer.users_db['wiener'],
                        "message": "Mass assignment exploit successful! User elevated to administrator.",
                        "objectiveCompleted": True
                    }
                    self.wfile.write(json.dumps(payload, indent=2).encode('utf-8'))
                    return
            except Exception:
                pass

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"status": "UPDATED"}).encode('utf-8'))

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Documentation BFLA Challenge Endpoint: DELETE /api/v1/users/carlos
        if path.startswith('/api/v1/users/'):
            username = path.split('/')[-1]
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()

            if username == 'carlos':
                DynamicVulnerableAPIServer.carlos_deleted = True
                if 'carlos' in DynamicVulnerableAPIServer.users_db:
                    del DynamicVulnerableAPIServer.users_db['carlos']
                
                resp_payload = {
                    "status": "SUCCESS",
                    "action": "USER_DELETED",
                    "username": "carlos",
                    "message": "User account 'carlos' permanently deleted via undocumented API endpoint.",
                    "objectiveCompleted": True
                }
                self.wfile.write(json.dumps(resp_payload, indent=2).encode('utf-8'))
            else:
                self.wfile.write(json.dumps({"status": "SUCCESS", "deleted": username}, indent=2).encode('utf-8'))
            return

        self.send_response(400)
        self._send_cors_headers()
        self.end_headers()

def run_server(port=8101, exercise_id="ex-bfla-01", session_id="sess_demo", session_token="tok_demo"):
    DynamicVulnerableAPIServer.port = port
    DynamicVulnerableAPIServer.exercise_id = exercise_id
    DynamicVulnerableAPIServer.session_id = session_id
    DynamicVulnerableAPIServer.session_token = session_token
    server = HTTPServer(('0.0.0.0', port), DynamicVulnerableAPIServer)
    server.serve_forever()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8101
    ex_id = sys.argv[2] if len(sys.argv) > 2 else "ex-bfla-01"
    sess_id = sys.argv[3] if len(sys.argv) > 3 else "sess_demo"
    sess_tok = sys.argv[4] if len(sys.argv) > 4 else "tok_demo"
    run_server(port, ex_id, sess_id, sess_tok)
