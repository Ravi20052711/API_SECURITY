import logging

logger = logging.getLogger(__name__)

class ChallengeRegistry:
    """
    Centralized Dynamic Challenge Registry.
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
            "owasp": "API2:2023 - Broken Authentication",
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
