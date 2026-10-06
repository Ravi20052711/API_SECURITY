"""
Parallel Question Banks for Pre-Test and Post-Test Conceptual Assessments.
Covers:
 1. Authentication vs Authorization
 2. HTTP/API Request Interpretation
 3. BOLA (API1:2023)
 4. BOPLA / Mass Assignment (API3:2023)
 5. BFLA (API5:2023)
 6. Response Interpretation
 7. Vulnerability Identification
 8. Mitigation Principles
"""

PRE_TEST_QUESTIONS = [
    {
        "code": "PRE-Q1",
        "category": "Authentication vs Authorization",
        "text": "What is the primary technical distinction between Authentication and Authorization in API security?",
        "option_a": "Authentication verifies identity (who you are); Authorization determines permissions (what you can access).",
        "option_b": "Authentication encrypts request headers; Authorization validates SSL certificates.",
        "option_c": "Authentication manages database connections; Authorization handles rate limiting.",
        "option_d": "Authentication checks query parameters; Authorization verifies POST request body syntax.",
        "correct_option": "A",
        "explanation": "Authentication confirms identity via credentials/tokens. Authorization enforces access policy on resources."
    },
    {
        "code": "PRE-Q2",
        "category": "HTTP/API Request Interpretation",
        "text": "An HTTP request contains 'GET /api/v1/users/1042/profile HTTP/1.1'. Which component represents the resource identifier?",
        "option_a": "GET",
        "option_b": "1042",
        "option_c": "HTTP/1.1",
        "option_d": "profile",
        "correct_option": "B",
        "explanation": "1042 is the dynamic object resource identifier (ID) in the API path."
    },
    {
        "code": "PRE-Q3",
        "category": "BOLA (API1:2023)",
        "text": "A student logged in as User #101 changes their browser request URL from '/api/v1/invoices/101' to '/api/v1/invoices/102' and views another user's bill. What vulnerability is present?",
        "option_a": "Server-Side Request Forgery (SSRF)",
        "option_b": "Broken Object Level Authorization (BOLA)",
        "option_c": "Cross-Site Scripting (XSS)",
        "option_d": "Unrestricted Rate Limiting",
        "correct_option": "B",
        "explanation": "BOLA occurs when an API fails to validate that the authenticated user owns or has permission to access the requested object ID."
    },
    {
        "code": "PRE-Q4",
        "category": "BOPLA / Mass Assignment (API3:2023)",
        "text": "When updating a user profile via 'PUT /api/v1/profile', an attacker adds '\"is_admin\": true' to the JSON payload. The server updates the database and grants admin access. What is this flaw called?",
        "option_a": "SQL Injection",
        "option_b": "Broken Property Level Authorization / Mass Assignment",
        "option_c": "Cross-Origin Resource Sharing (CORS) Misconfiguration",
        "option_d": "JWT Signature Stripping",
        "correct_option": "B",
        "explanation": "Mass Assignment occurs when client JSON properties automatically bind to internal object properties without property-level filtering."
    },
    {
        "code": "PRE-Q5",
        "category": "BFLA (API5:2023)",
        "text": "A standard user sends a request to 'DELETE /api/v1/admin/users/99'. The server returns HTTP 200 OK and deletes the account. What vulnerability allowed this?",
        "option_a": "Broken Function Level Authorization (BFLA)",
        "option_b": "Broken Object Element Binding",
        "option_c": "Session Timeout Failure",
        "option_d": "Unencrypted Transit Header",
        "correct_option": "A",
        "explanation": "BFLA happens when administrative or privileged functions fail to restrict execution to authorized roles."
    },
    {
        "code": "PRE-Q6",
        "category": "Response Interpretation",
        "text": "An API returns 'HTTP/1.1 403 Forbidden' with body '{\"error\": \"Role 'student' not permitted for administrative action\"}'. How should this response be interpreted?",
        "option_a": "The user is not logged in (Authentication failure).",
        "option_b": "The user is authenticated, but access was denied by authorization controls.",
        "option_c": "The server crashed due to an unhandled exception.",
        "option_d": "The API path does not exist on the server.",
        "correct_option": "B",
        "explanation": "HTTP 403 Forbidden indicates the server understood the authenticated identity, but authorization policies denied access."
    },
    {
        "code": "PRE-Q7",
        "category": "Vulnerability Identification",
        "text": "You inspect an API request payload: 'POST /api/v1/webhooks/subscribe' with payload '{\"url\": \"http://169.254.169.254/latest/meta-data/\"}'. The server returns cloud credentials. What flaw is identified?",
        "option_a": "BOLA",
        "option_b": "Server-Side Request Forgery (SSRF)",
        "option_c": "Broken Function Level Authorization",
        "option_d": "JSON Web Token Discrepancy",
        "correct_option": "B",
        "explanation": "SSRF occurs when an API fetches remote resources without validating user-supplied URLs, allowing internal metadata queries."
    },
    {
        "code": "PRE-Q8",
        "category": "Mitigation Principles",
        "text": "Which developer practice effectively mitigates BOLA vulnerabilities in REST APIs?",
        "option_a": "Using HTTPS TLS 1.3 encryption on all connections.",
        "option_b": "Enforcing server-side authorization checks verifying user ownership for every resource access attempt.",
        "option_c": "Hiding API endpoints behind long randomized URL strings.",
        "option_d": "Compressing JSON responses with GZIP.",
        "correct_option": "B",
        "explanation": "Explicitly checking that the requesting user context has permission to access the target object ID prevents BOLA."
    }
]

POST_TEST_QUESTIONS = [
    {
        "code": "POST-Q1",
        "category": "Authentication vs Authorization",
        "text": "A user presents a valid JWT signed by the server, but receives HTTP 403 when requesting '/api/v1/financial-reports'. Which control denied the request?",
        "option_a": "Authentication Control",
        "option_b": "Authorization Control",
        "option_c": "Transport Layer Encryption",
        "option_d": "API Gateway Rate Limiter",
        "correct_option": "B",
        "explanation": "The JWT verified identity (Authentication passed), but permissions were denied by Authorization policy."
    },
    {
        "code": "POST-Q2",
        "category": "HTTP/API Request Interpretation",
        "text": "Inspect the request line: 'PATCH /api/v2/orders/7710/items HTTP/1.1'. What HTTP method is used, and what object ID is referenced?",
        "option_a": "Method: POST | Object ID: 2",
        "option_b": "Method: PATCH | Object ID: 7710",
        "option_c": "Method: GET | Object ID: items",
        "option_d": "Method: PUT | Object ID: 1.1",
        "correct_option": "B",
        "explanation": "PATCH modifies partial resources. 7710 is the target order resource ID."
    },
    {
        "code": "POST-Q3",
        "category": "BOLA (API1:2023)",
        "text": "Student A (ID: 55) sends 'GET /api/v1/medical-records/88' (belonging to Student B). The server returns Student B's private medical history. Which vulnerability is demonstrated?",
        "option_a": "Broken Function Level Authorization (BFLA)",
        "option_b": "Broken Object Level Authorization (BOLA)",
        "option_c": "Server-Side Request Forgery (SSRF)",
        "option_d": "Improper Inventory Management",
        "correct_option": "B",
        "explanation": "Accessing object ID 88 belonging to another user without permission checks is BOLA."
    },
    {
        "code": "POST-Q4",
        "category": "BOPLA / Mass Assignment (API3:2023)",
        "text": "During account registration, an attacker appends '\"role\": \"instructor\"' to the request JSON. The API creates an instructor account instead of a student account. How is this prevented?",
        "option_a": "By obfuscating JavaScript bundle code.",
        "option_b": "By using strict Data Transfer Objects (DTOs) or DTO field white-listing on the server.",
        "option_c": "By increasing JWT token expiration times.",
        "option_d": "By restricting HTTP method verbs to GET only.",
        "correct_option": "B",
        "explanation": "DTO whitelisting ensures only client-editable properties are bound to database models."
    },
    {
        "code": "POST-Q5",
        "category": "BFLA (API5:2023)",
        "text": "An API exposes 'POST /api/v1/export/all-db-backups'. An unauthenticated guest sends this request and receives a database dump. What type of authorization failure occurred?",
        "option_a": "Broken Function Level Authorization (BFLA)",
        "option_b": "Rate Limiting Exhaustion",
        "option_c": "CORS Header Injection",
        "option_d": "SQL Syntax Failure",
        "correct_option": "A",
        "explanation": "Exposing sensitive administrative functions without role enforcement is BFLA."
    },
    {
        "code": "POST-Q6",
        "category": "Response Interpretation",
        "text": "An API response headers include 'HTTP/1.1 401 Unauthorized' and 'WWW-Authenticate: Bearer realm=\"api\"'. What action must the client take?",
        "option_a": "Provide valid identity credentials or a valid JWT bearer token.",
        "option_b": "Change the HTTP request method from GET to POST.",
        "option_c": "Request a higher user role from the administrator.",
        "option_d": "Clear local DNS cache.",
        "correct_option": "A",
        "explanation": "HTTP 401 Unauthorized indicates missing or invalid authentication credentials."
    },
    {
        "code": "POST-Q7",
        "category": "Vulnerability Identification",
        "text": "An API endpoint 'POST /api/v1/profile/avatar' takes a URL parameter 'avatar_url: http://localhost:8000/admin/debug'. The server responds with internal debug details. Which vulnerability was exploited?",
        "option_a": "SSRF (Server-Side Request Forgery)",
        "option_b": "Mass Assignment",
        "option_c": "BOLA",
        "option_d": "JWT Signature Tampering",
        "correct_option": "A",
        "explanation": "Forcing the server to issue requests to internal/loopback services is SSRF."
    },
    {
        "code": "POST-Q8",
        "category": "Mitigation Principles",
        "text": "Which principle best defends against Broken Function Level Authorization (BFLA)?",
        "option_a": "Default-Deny Role-Based Access Control (RBAC) enforced on every endpoint function.",
        "option_b": "Encrypting request JSON payloads with AES-256.",
        "option_c": "Storing user passwords as plaintext in memory.",
        "option_d": "Using short query parameter strings.",
        "correct_option": "A",
        "explanation": "Default-deny RBAC checks role privileges at the function level before handling the request."
    }
]

USABILITY_SUS_QUESTIONS = [
    {
        "code": "SUS-Q1",
        "category": "Usability",
        "text": "I think that I would like to use this API security lab platform frequently.",
        "type": "LIKERT_1_5"
    },
    {
        "code": "SUS-Q2",
        "category": "Usability",
        "text": "I found the platform unnecessarily complex to navigate.",
        "type": "LIKERT_1_5"
    },
    {
        "code": "SUS-Q3",
        "category": "Usability",
        "text": "I thought the platform was easy to use.",
        "type": "LIKERT_1_5"
    },
    {
        "code": "SUS-Q4",
        "category": "Usability",
        "text": "I felt very confident using the platform during guided exercises.",
        "type": "LIKERT_1_5"
    },
    {
        "code": "SUS-Q5",
        "category": "Usability",
        "text": "The AI assistant provided helpful contextual guidance without giving away flags directly.",
        "type": "LIKERT_1_5"
    }
]
