export const USER_ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ASSESSOR: 'assessor'
};

export const MODULE_CATEGORIES = [
  { id: 'bola', name: 'BOLA (Broken Object Level Authorization)', owasp: 'API1:2023', count: 4 },
  { id: 'auth', name: 'Broken Authentication', owasp: 'API2:2023', count: 3 },
  { id: 'property', name: 'Broken Property Level Authorization', owasp: 'API3:2023', count: 3 },
  { id: 'resource', name: 'Unrestricted Resource Consumption', owasp: 'API4:2023', count: 2 },
  { id: 'bfla', name: 'BFLA (Broken Function Level Authorization)', owasp: 'API5:2023', count: 4 },
  { id: 'business_flow', name: 'Sensitive Business Flow Abuse', owasp: 'API6:2023', count: 2 },
  { id: 'ssrf', name: 'Server Side Request Forgery (SSRF)', owasp: 'API7:2023', count: 3 },
  { id: 'misconfig', name: 'Security Misconfiguration', owasp: 'API8:2023', count: 2 },
  { id: 'inventory', name: 'Improper Inventory Management', owasp: 'API9:2023', count: 2 },
  { id: 'unsafe_consumption', name: 'Unsafe Consumption of APIs', owasp: 'API10:2023', count: 2 }
];

export const EXERCISES = [
  {
    id: 'ex-bola-01',
    title: 'BOLA: Cross-Tenant Asset Theft',
    category: 'bola',
    owasp: 'API1:2023',
    difficulty: 'Beginner',
    estimatedTime: '15 min',
    status: 'in_progress',
    scenario: 'Tenant "tenant-alpha" operates an isolated telemetry node. The REST endpoint /api/v1/tenants/{tenant_id}/assets/{asset_id} retrieves asset details. The backend accepts tenant and asset IDs from the path without validating ownership against the authenticated JWT token claims.',
    objective: 'Verify whether an attacker authenticated under "tenant-alpha" can read confidential asset metadata belonging to "tenant-beta" (Asset ID: AST-9021).',
    boundary: 'Authorized only against local synthetic container target "FIX-BOLA-2026". No production access.',
    steps: [
      { id: 1, text: 'Inspect user auth token and path parameters', completed: true },
      { id: 2, text: 'Change target asset ID to AST-9021 (belonging to tenant-beta)', completed: false },
      { id: 3, text: 'Send GET request and verify unauthorized payload extraction', completed: false }
    ],
    hints: [
      { id: 1, title: 'Inspect Resource Identifiers', text: 'Look closely at the request path: /tenants/tenant-beta/assets/AST-9021. Notice that your auth token belongs to tenant-alpha.', penalty: 5 },
      { id: 2, title: 'Header vs Path Discrepancy', text: 'Try changing the X-Tenant-ID header to "tenant-alpha" while requesting "tenant-beta" in the URI.', penalty: 10 },
      { id: 3, title: 'Expected Payload', text: 'If successful, the backend will return HTTP 200 with tenant-beta asset payload.', penalty: 15 }
    ],
    presetRequest: {
      method: 'GET',
      path: '/api/v1/tenants/tenant-beta/assets/AST-9021',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tenant_alpha_token',
        'X-Tenant-ID': 'tenant-alpha',
        'Accept': 'application/json'
      },
      body: ''
    },
    mockResponse: {
      status: 200,
      statusText: 'OK',
      responseTime: '42ms',
      headers: {
        'content-type': 'application/json',
        'x-oracle-eval': 'VERIFIED_EXPLOIT_MATCH'
      },
      body: {
        'asset_id': 'AST-9021',
        'owner_tenant': 'tenant-beta',
        'confidential_data': {
          'kms_alias': 'kms/tenant-beta-prod',
          'firmware_sha': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          'network_segment': '10.240.12.0/24'
        },
        'vulnerability_flag': 'BOLA_EXPLOITED_SUCCESS'
      }
    }
  },
  {
    id: 'ex-bfla-01',
    title: 'BFLA: Admin Key Revocation',
    category: 'bfla',
    owasp: 'API5:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'An administrative endpoint /api/v1/admin/access-keys/revoke is exposed under the API gateway. The handler fails to check if the caller possesses role: admin.',
    objective: 'Demonstrate that a standard user role can invoke administrative key revocation on system accounts.',
    boundary: 'Authorized against fixture FIX-BFLA-102.',
    steps: [
      { id: 1, text: 'Identify administrative endpoint path', completed: false },
      { id: 2, text: 'Craft POST body payload targeting system admin key ID', completed: false }
    ],
    hints: [
      { id: 1, title: 'Endpoint Discovery', text: 'Examine administrative paths exposed without RBAC middleware.', penalty: 5 }
    ],
    presetRequest: {
      method: 'POST',
      path: '/api/v1/admin/access-keys/revoke',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.standard_user_token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ target_key_id: 'KEY-SYS-ADMIN-01' }, null, 2)
    },
    mockResponse: {
      status: 200,
      statusText: 'OK',
      responseTime: '38ms',
      headers: { 'content-type': 'application/json' },
      body: { status: 'REVOKED', key_id: 'KEY-SYS-ADMIN-01', bfla_flag: 'EXPLOIT_VERIFIED' }
    }
  },
  {
    id: 'ex-mass-01',
    title: 'Mass Assignment: Role Injection',
    category: 'property',
    owasp: 'API3:2023',
    difficulty: 'Intermediate',
    estimatedTime: '20 min',
    status: 'available',
    scenario: 'Updating profile data via PUT /api/v1/users/self automatically binds JSON keys directly to internal DB model fields without filtering sensitive properties.',
    objective: 'Inject payload property "role": "platform_admin" during self-profile update.',
    boundary: 'Target FIX-MASS-04.',
    steps: [
      { id: 1, text: 'Add property "role": "platform_admin" to PUT payload', completed: false }
    ],
    hints: [
      { id: 1, title: 'Inspect DTO binding', text: 'Pass additional JSON attributes in the body payload.', penalty: 5 }
    ],
    presetRequest: {
      method: 'PUT',
      path: '/api/v1/users/self',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user_token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Jane Learner', role: 'platform_admin' }, null, 2)
    },
    mockResponse: {
      status: 200,
      statusText: 'OK',
      responseTime: '30ms',
      headers: { 'content-type': 'application/json' },
      body: { user_id: 'USR-99', role: 'platform_admin', mass_assignment_flag: 'SUCCESS' }
    }
  },
  {
    id: 'ex-ssrf-01',
    title: 'SSRF: Internal Metadata Service Leak',
    category: 'ssrf',
    owasp: 'API7:2023',
    difficulty: 'Advanced',
    estimatedTime: '25 min',
    status: 'available',
    scenario: 'The webhook notification preview route /api/v1/webhooks/preview accepts an arbitrary URL parameter and fetches it server-side without restricting internal loopback IPs.',
    objective: 'Extract cloud instance IAM credentials via http://169.254.169.254/latest/meta-data/iam/security-credentials/.',
    boundary: 'Target FIX-SSRF-99.',
    steps: [
      { id: 1, text: 'Pass internal cloud metadata URL to webhook parameter', completed: false }
    ],
    hints: [
      { id: 1, title: 'Metadata URL', text: 'Use AWS/GCP internal metadata IP endpoints.', penalty: 10 }
    ],
    presetRequest: {
      method: 'POST',
      path: '/api/v1/webhooks/preview',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials/' }, null, 2)
    },
    mockResponse: {
      status: 200,
      statusText: 'OK',
      responseTime: '110ms',
      headers: { 'content-type': 'application/json' },
      body: { AccessKeyId: 'ASIAIOSFODNN7EXAMPLE', SecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' }
    }
  }
];

export const KPI_METRICS = [
  { id: 'KPI-1', name: 'Technique Transfer Score', score: '84/100', target: '>= 80', status: 'PASS', context: '+6 pts vs O2 baseline' },
  { id: 'KPI-2', name: 'Exercise Completion Rate', score: '88/100', target: '>= 80', status: 'PASS', context: '+8 pts vs O2 baseline' },
  { id: 'KPI-3', name: 'Realism Assessment Rating', score: '86/100', target: '>= 80', status: 'PASS', context: 'Evaluated by 2 raters' },
  { id: 'KPI-4', name: 'Unsafe Outcome Count', score: '0', target: '== 0', status: 'PASS', context: 'Zero security excursions' },
  { id: 'KPI-5', name: 'Attack Path Detection Rate', score: '94.2%', target: '>= 94%', status: 'PASS', context: '+3.2% vs O2 baseline' },
  { id: 'KPI-6', name: 'False Positive Rate', score: '1.8%', target: '<= 2.4%', status: 'OPTIMAL', context: '0.6x O2 baseline' }
];

export const TRANSFER_TARGETS = [
  { id: 'tgt-med-01', name: 'HealthCare EHR API Target', domain: 'Medical Records', difficulty: 'Advanced', status: 'Unlocked' },
  { id: 'tgt-fin-02', name: 'FinTech Payment Gateway API', domain: 'Financial Services', difficulty: 'Advanced', status: 'Locked' },
  { id: 'tgt-log-03', name: 'Logistics Telemetry Network', domain: 'Supply Chain', difficulty: 'Intermediate', status: 'Locked' }
];
