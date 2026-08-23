import logging

logger = logging.getLogger(__name__)

class ChallengeRegistry:
    """
    Centralized Dynamic Challenge Registry (Complete 12-Lab OWASP API Security Suite).
    Guarantees every lab has a unique problem statement, instructions, vulnerable behavior,
    objective, target objects/credentials, and server-side verification logic.
    """

    CHALLENGES = {
        "ex-bfla-01": {
            "lab_id": "api-bfla-001",
            "exercise_id": "ex-bfla-01",
            "type": "API_DOCUMENTATION_BFLA",
            "title": "Lab: Exploiting an API endpoint using documentation",
            "owasp": "API2:2023 - Broken Function Level Authorization",
            "difficulty": "Apprentice",
            "time_limit": 1200,
            "problem_statement": (
                "This application exposes an administrative API endpoint without proper authorization checks. "
                "Exposed interactive API documentation reveals the undocumented user deletion operation."
            ),
            "objective": (
                "Discover the exposed API documentation endpoint (/api/v1/docs or /api/v1/openapi.json), "
                "identify the unprotected user deletion operation, and send a request to delete the user account 'carlos'."
            ),
            "target_user": "carlos",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "database_state",
                "target_entity": "carlos",
                "condition": "user_deleted"
            }
        },
        "ex-bola-01": {
            "lab_id": "api-bola-001",
            "exercise_id": "ex-bola-01",
            "type": "BOLA",
            "title": "Lab: Broken Object Level Authorization (IDOR)",
            "owasp": "API1:2023 - Broken Object Level Authorization",
            "difficulty": "Intermediate",
            "time_limit": 1200,
            "problem_statement": (
                "You are authenticated as normal user 'wiener' (userId: 1001). The application exposes an API endpoint "
                "GET /api/v1/users/{userId}/invoices to retrieve user invoice records. The server fails to verify that "
                "the requested object belongs to the authenticated user."
            ),
            "objective": (
                "Identify and exploit the BOLA flaw to access confidential invoice record INV-888 belonging to target user 'carlos' (userId: 1002)."
            ),
            "target_user": "carlos",
            "target_object": "INV-888",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "request_log_state",
                "target_object": "INV-888",
                "condition": "unauthorized_object_accessed"
            }
        },
        "ex-mass-01": {
            "lab_id": "api-mass-001",
            "exercise_id": "ex-mass-01",
            "type": "MASS_ASSIGNMENT",
            "title": "Lab: Mass Assignment / Property Authorization Bypass",
            "owasp": "API3:2023 - Broken Property Level Authorization",
            "difficulty": "Intermediate",
            "time_limit": 1200,
            "problem_statement": (
                "The profile management API endpoint PATCH /api/v1/users/me allows users to update their profile email. "
                "However, the server automatically binds JSON parameters directly to the user model without filtering writable parameters."
            ),
            "objective": (
                "Exploit mass assignment by crafting a PATCH request to /api/v1/users/me containing 'role': 'administrator' "
                "to elevate user 'wiener' to administrator privileges."
            ),
            "target_user": "wiener",
            "target_property": "role",
            "expected_value": "administrator",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "database_state",
                "target_entity": "wiener",
                "condition": "role_elevated_to_administrator"
            }
        },
        "ex-rate-01": {
            "lab_id": "api-rate-001",
            "exercise_id": "ex-rate-01",
            "type": "UNRESTRICTED_CONSUMPTION",
            "title": "Lab: Unrestricted Resource Consumption (OTP Brute Force)",
            "owasp": "API4:2023 - Unrestricted Resource Consumption",
            "difficulty": "Intermediate",
            "time_limit": 1200,
            "problem_statement": (
                "The password reset verification endpoint POST /api/v1/auth/reset-otp accepts a 4-digit numeric OTP. "
                "The server lacks rate limiting headers, IP throttling, or account lockout mechanisms."
            ),
            "objective": (
                "Brute-force the 4-digit verification OTP (target code: 8841) to trigger a valid password reset token for victim user carlos."
            ),
            "target_user": "carlos",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "rate_limit_bypass",
                "target_entity": "carlos",
                "condition": "otp_8841_accepted"
            }
        },
        "ex-ssrf-01": {
            "lab_id": "api-ssrf-001",
            "exercise_id": "ex-ssrf-01",
            "type": "SSRF",
            "title": "Lab: Server-Side Request Forgery in Avatar Fetcher",
            "owasp": "API7:2023 - Server Side Request Forgery",
            "difficulty": "Advanced",
            "time_limit": 1200,
            "problem_statement": (
                "The application provides a feature POST /api/v1/fetch-avatar that accepts an external image URL and fetches "
                "the avatar on behalf of the user. The backend fails to restrict access to internal IP addresses."
            ),
            "objective": (
                "Coerce the server to make an internal HTTP GET request to http://169.254.169.254/latest/meta-data/iam/security-credentials "
                "and extract the internal cloud IAM credentials."
            ),
            "target_url": "http://169.254.169.254/latest/meta-data/iam/security-credentials",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "application_state",
                "condition": "internal_metadata_exfiltrated"
            }
        },
        "ex-jwt-01": {
            "lab_id": "api-jwt-001",
            "exercise_id": "ex-jwt-01",
            "type": "JWT",
            "title": "Lab: JWT Unsigned Algorithm Authentication Bypass",
            "owasp": "API8:2023 - Security Misconfiguration",
            "difficulty": "Intermediate",
            "time_limit": 1200,
            "problem_statement": (
                "The application authenticates API requests using JWT bearer tokens. However, the JWT verification library "
                "flawlessly accepts tokens with the header algorithm set to 'none'."
            ),
            "objective": (
                "Forge a JWT token for user 'carlos' with 'alg': 'none', strip the signature, and access the restricted administrative flag endpoint GET /api/v1/admin/flag."
            ),
            "target_user": "carlos",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "application_state",
                "condition": "none_alg_jwt_accepted"
            }
        },
        "ex-sqli-01": {
            "lab_id": "api-sqli-001",
            "exercise_id": "ex-sqli-01",
            "type": "SQLI",
            "title": "Lab: SQL Injection in User Search API",
            "owasp": "API8:2023 - Security Misconfiguration",
            "difficulty": "Intermediate",
            "time_limit": 1200,
            "problem_statement": (
                "The user directory endpoint GET /api/v1/users/search?q= accepts a query parameter and concatenates it directly "
                "into an unparsed SQL SELECT query string."
            ),
            "objective": (
                "Inject SQL query payload ' OR '1'='1 into parameter q to extract all hidden administrator profiles from the database."
            ),
            "target_user": "administrator",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "sqli_state",
                "condition": "admin_records_dumped"
            }
        },
        "ex-cors-01": {
            "lab_id": "api-cors-001",
            "exercise_id": "ex-cors-01",
            "type": "CORS",
            "title": "Lab: Arbitrary Origin CORS Exploitation",
            "owasp": "API8:2023 - Security Misconfiguration",
            "difficulty": "Intermediate",
            "time_limit": 1200,
            "problem_statement": (
                "The user token endpoint GET /api/v1/user/sensitive-token reflects whatever Origin header is sent by the client, "
                "with Access-Control-Allow-Credentials: true."
            ),
            "objective": (
                "Send a request with Origin: https://attacker.com to exfiltrate the secret administrative token."
            ),
            "target_user": "administrator",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "cors_state",
                "condition": "arbitrary_origin_accepted"
            }
        },
        "ex-cmdi-01": {
            "lab_id": "api-cmdi-001",
            "exercise_id": "ex-cmdi-01",
            "type": "COMMAND_INJECTION",
            "title": "Lab: OS Command Injection in PDF Exporter",
            "owasp": "API10:2023 - Unsafe Consumption of APIs",
            "difficulty": "Advanced",
            "time_limit": 1200,
            "problem_statement": (
                "The report generator endpoint POST /api/v1/export/pdf takes a filename string and passes it directly to a system shell execution call."
            ),
            "objective": (
                "Inject command payload ; cat /etc/passwd into the filename field to exfiltrate system account details."
            ),
            "target_user": "root",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "command_state",
                "condition": "os_command_executed"
            }
        },
        "ex-xxe-01": {
            "lab_id": "api-xxe-001",
            "exercise_id": "ex-xxe-01",
            "type": "XXE",
            "title": "Lab: XML External Entity (XXE) Injection in API Parser",
            "owasp": "API5:2023 - Broken Function Level Authorization",
            "difficulty": "Advanced",
            "time_limit": 1200,
            "problem_statement": (
                "The XML configuration endpoint POST /api/v1/xml/parse parses user-supplied XML data with external entity resolution enabled."
            ),
            "objective": (
                "Submit an XML payload declaring external entity SYSTEM 'file:///etc/passwd' to retrieve system credentials."
            ),
            "target_user": "root",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "xxe_state",
                "condition": "xxe_entity_resolved"
            }
        },
        "ex-nosql-01": {
            "lab_id": "api-nosql-001",
            "exercise_id": "ex-nosql-01",
            "type": "NOSQL",
            "title": "Lab: NoSQL Injection Authentication Bypass",
            "owasp": "API3:2023 - Broken Property Level Authorization",
            "difficulty": "Intermediate",
            "time_limit": 1200,
            "problem_statement": (
                "The authentication endpoint POST /api/v1/auth/login parses JSON parameters directly into a MongoDB query dictionary without type checking."
            ),
            "objective": (
                "Submit password object {'$ne': null} to log in as administrator without knowing the secret password."
            ),
            "target_user": "admin",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "nosql_state",
                "condition": "nosql_operator_injected"
            }
        },
        "ex-graphql-01": {
            "lab_id": "api-graphql-001",
            "exercise_id": "ex-graphql-01",
            "type": "GRAPHQL",
            "title": "Lab: GraphQL Introspection & Field Disclosure",
            "owasp": "API9:2023 - Improper Assets Management",
            "difficulty": "Apprentice",
            "time_limit": 1200,
            "problem_statement": (
                "The endpoint POST /graphql has introspection enabled in production, exposing unpublished administrative schema definitions."
            ),
            "objective": (
                "Query __schema { types { name } } via GraphQL to discover the hidden secret admin field."
            ),
            "target_user": "admin",
            "authenticated_user": "wiener",
            "credentials": {"username": "wiener", "password": "peter"},
            "verification": {
                "type": "graphql_state",
                "condition": "introspection_queried"
            }
        }
    }

    @classmethod
    def get_challenge(cls, exercise_or_lab_id):
        """Retrieves structured challenge configuration by lab_id or exercise_id"""
        for key, cfg in cls.CHALLENGES.items():
            if cfg["lab_id"] == exercise_or_lab_id or cfg["exercise_id"] == exercise_or_lab_id or key == exercise_or_lab_id:
                return cfg
        
        # Check custom DB modules
        try:
            from .models import ExerciseModule
            m = ExerciseModule.objects.filter(module_id=exercise_or_lab_id).first()
            if m:
                return {
                    "lab_id": f"lab-{m.module_id}",
                    "exercise_id": m.module_id,
                    "type": "CUSTOM_LAB",
                    "title": m.title,
                    "owasp": m.owasp_code,
                    "difficulty": m.difficulty,
                    "time_limit": 1200,
                    "problem_statement": m.scenario_description or f"Custom Security Exercise: {m.title}",
                    "objective": m.learning_objective or f"Complete hands-on exploitation for {m.title}",
                    "authenticated_user": "wiener",
                    "credentials": {"username": "wiener", "password": "peter"}
                }
        except Exception:
            pass

        return cls.CHALLENGES["ex-bfla-01"]

    @classmethod
    def get_all_challenges(cls):
        base_list = list(cls.CHALLENGES.values())
        try:
            from .models import ExerciseModule
            db_modules = ExerciseModule.objects.all()
            for m in db_modules:
                if not any(b['exercise_id'] == m.module_id for b in base_list):
                    base_list.append({
                        "lab_id": f"lab-{m.module_id}",
                        "exercise_id": m.module_id,
                        "type": "CUSTOM_LAB",
                        "title": m.title,
                        "owasp": m.owasp_code,
                        "difficulty": m.difficulty,
                        "time_limit": 1200,
                        "problem_statement": m.scenario_description or f"Custom Security Exercise: {m.title}",
                        "objective": m.learning_objective or f"Complete hands-on exploitation for {m.title}",
                        "authenticated_user": "wiener",
                        "credentials": {"username": "wiener", "password": "peter"}
                    })
        except Exception:
            pass

        return base_list
