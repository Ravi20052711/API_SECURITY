export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ASSESSOR: 'assessor'
};

export const MODULE_CATEGORIES = [
  { id: 'all', name: 'All Modules', owasp: 'OWASP TOP 10', count: 12 },
  { id: 'bola', name: 'Broken Object Level Authorization', owasp: 'API1:2023', count: 1 },
  { id: 'auth', name: 'Broken Authentication', owasp: 'API2:2023', count: 2 },
  { id: 'property', name: 'Broken Property Level Authorization', owasp: 'API3:2023', count: 2 },
  { id: 'resource', name: 'Unrestricted Resource Consumption', owasp: 'API4:2023', count: 1 },
  { id: 'bfla', name: 'Broken Function Level Authorization', owasp: 'API5:2023', count: 2 },
  { id: 'ssrf', name: 'Server Side Request Forgery (SSRF)', owasp: 'API7:2023', count: 1 },
  { id: 'misconfig', name: 'Security Misconfiguration', owasp: 'API8:2023', count: 3 },
  { id: 'inventory', name: 'Improper Assets Management', owasp: 'API9:2023', count: 1 },
  { id: 'unsafe_consumption', name: 'Unsafe Consumption of APIs', owasp: 'API10:2023', count: 1 }
];

export const EXERCISES = [
  {
    id: 'ex-bfla-01',
    title: 'Lab: Exploiting an API endpoint using documentation (BFLA)',
    category: 'bfla',
    owasp: 'API2:2023',
    difficulty: 'Apprentice',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'This application exposes an administrative API endpoint without proper authorization checks. Exposed interactive API documentation reveals the undocumented user deletion operation.',
    objective: 'Discover the exposed API documentation endpoint (/api/v1/docs), identify the unprotected user deletion operation, and delete user carlos.'
  },
  {
    id: 'ex-bola-01',
    title: 'Lab: Broken Object Level Authorization (IDOR)',
    category: 'bola',
    owasp: 'API1:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'You are authenticated as normal user wiener (userId: 1001). The application exposes GET /api/v1/users/{userId}/invoices to retrieve invoice records without authorization checks.',
    objective: 'Identify and exploit the BOLA flaw to access confidential invoice record INV-888 belonging to target user carlos.'
  },
  {
    id: 'ex-mass-01',
    title: 'Lab: Mass Assignment / Property Authorization Bypass',
    category: 'property',
    owasp: 'API3:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The profile API endpoint PATCH /api/v1/users/me allows email updates but automatically binds JSON parameters directly to the database without field filtering.',
    objective: 'Craft a PATCH request containing "role": "administrator" to elevate user wiener to administrator privileges.'
  },
  {
    id: 'ex-rate-01',
    title: 'Lab: Unrestricted Resource Consumption (OTP Brute Force)',
    category: 'resource',
    owasp: 'API4:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The password reset endpoint POST /api/v1/auth/reset-otp accepts a 4-digit numeric OTP without rate limiting headers or IP throttling.',
    objective: 'Brute-force the 4-digit verification OTP (target code: 8841) to trigger a valid password reset token for victim user carlos.'
  },
  {
    id: 'ex-ssrf-01',
    title: 'Lab: Server-Side Request Forgery in Avatar Fetcher',
    category: 'ssrf',
    owasp: 'API7:2023',
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The application provides POST /api/v1/fetch-avatar that accepts external image URLs but fails to restrict internal IP addresses.',
    objective: 'Coerce the server to make an internal HTTP GET request to http://169.254.169.254 to extract internal AWS cloud IAM credentials.'
  },
  {
    id: 'ex-jwt-01',
    title: 'Lab: JWT Unsigned Algorithm Authentication Bypass',
    category: 'auth',
    owasp: 'API8:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The application authenticates API requests using JWT bearer tokens. However, the JWT verification engine accepts tokens with "alg": "none".',
    objective: 'Forge a JWT token for user carlos with "alg": "none", strip the signature, and access the restricted GET /api/v1/admin/flag.'
  },
  {
    id: 'ex-sqli-01',
    title: 'Lab: SQL Injection in User Search API',
    category: 'misconfig',
    owasp: 'API8:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The user search directory GET /api/v1/users/search?q= concatenates user inputs directly into an unparsed SQL query string.',
    objective: 'Inject SQL query payload \' OR \'1\'=\'1 into parameter q to extract all hidden administrator profiles from the database.'
  },
  {
    id: 'ex-cors-01',
    title: 'Lab: Arbitrary Origin CORS Exploitation',
    category: 'misconfig',
    owasp: 'API8:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The user token endpoint GET /api/v1/user/sensitive-token reflects whatever Origin header is sent by the client with credentials enabled.',
    objective: 'Send a request with Origin: https://attacker.com to exfiltrate the secret administrative token.'
  },
  {
    id: 'ex-cmdi-01',
    title: 'Lab: OS Command Injection in PDF Exporter',
    category: 'unsafe_consumption',
    owasp: 'API10:2023',
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The report generator endpoint POST /api/v1/export/pdf takes a filename string and passes it directly to a system shell execution call.',
    objective: 'Inject command payload ; cat /etc/passwd into the filename field to exfiltrate system account details.'
  },
  {
    id: 'ex-xxe-01',
    title: 'Lab: XML External Entity (XXE) Injection in API Parser',
    category: 'bfla',
    owasp: 'API5:2023',
    difficulty: 'Advanced',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The XML configuration endpoint POST /api/v1/xml/parse parses user-supplied XML data with external entity resolution enabled.',
    objective: 'Submit an XML payload declaring external entity SYSTEM "file:///etc/passwd" to retrieve system credentials.'
  },
  {
    id: 'ex-nosql-01',
    title: 'Lab: NoSQL Injection Authentication Bypass',
    category: 'property',
    owasp: 'API3:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The authentication endpoint POST /api/v1/auth/login parses JSON parameters directly into a MongoDB query dictionary without type checking.',
    objective: 'Submit password object {"$ne": null} to log in as administrator without knowing the secret password.'
  },
  {
    id: 'ex-graphql-01',
    title: 'Lab: GraphQL Introspection & Field Disclosure',
    category: 'inventory',
    owasp: 'API9:2023',
    difficulty: 'Apprentice',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'The endpoint POST /graphql has introspection enabled in production, exposing unpublished administrative schema definitions.',
    objective: 'Query __schema { types { name } } via GraphQL to discover the hidden secret admin field.'
  }
];
