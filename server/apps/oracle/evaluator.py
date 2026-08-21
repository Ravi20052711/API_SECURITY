class OracleEvaluator:
    @staticmethod
    def evaluate(method, url, response_status, response_body):
        """
        Independent Ground-Truth Oracle Evaluator.
        Inspects request attributes and response payloads to detect unauthorized data leaks.
        """
        # BOLA Evaluation Rule
        if '1002' in url and response_status == 200:
            return {
                'is_exploited': True,
                'vulnerability_class': 'API1:2023 - Broken Object Level Authorization',
                'oracle_status': 'VERIFIED_EXPLOIT_MATCH',
                'explanation': 'The API returned data belonging to another principal (ID: 1002) without an authorization check.'
            }
        
        # BFLA Evaluation Rule
        if 'admin/access-keys/revoke' in url and response_status == 200:
            return {
                'is_exploited': True,
                'vulnerability_class': 'API5:2023 - Broken Function Level Authorization',
                'oracle_status': 'VERIFIED_EXPLOIT_MATCH',
                'explanation': 'Administrative key revocation endpoint was successfully invoked by an unprivileged role.'
            }

        # Mass Assignment Evaluation Rule
        if 'users/me' in url and isinstance(response_body, dict) and response_body.get('role') in ['admin', 'platform_admin']:
            return {
                'is_exploited': True,
                'vulnerability_class': 'API3:2023 - Broken Property Level Authorization',
                'oracle_status': 'VERIFIED_EXPLOIT_MATCH',
                'explanation': 'User successfully escalated privileges by injecting "role: admin" into the profile payload.'
            }

        # SSRF Evaluation Rule
        if ('fetch-avatar' in url or 'webhooks' in url) and isinstance(response_body, dict) and ('AccessKeyId' in response_body or '169.254.169.254' in str(response_body)):
            return {
                'is_exploited': True,
                'vulnerability_class': 'API7:2023 - Server Side Request Forgery',
                'oracle_status': 'VERIFIED_EXPLOIT_MATCH',
                'explanation': 'Server fetched cloud metadata credentials from internal loopback IP.'
            }

        return {
            'is_exploited': False,
            'vulnerability_class': 'NONE',
            'oracle_status': 'NORMAL_RESPONSE',
            'explanation': 'Request processed without security violations.'
        }
