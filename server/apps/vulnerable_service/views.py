from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

class BOLAView(APIView):
    """API1:2023 Broken Object Level Authorization Target"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        # Target ID 1002 triggers BOLA cross-tenant data leak
        if str(user_id) == '1002':
            return Response({
                'userId': 1002,
                'name': 'Alice Chen (Target Leak)',
                'ssn': '*x*-*x*-4412',
                'invoices': [
                    {'id': 'INV-88', 'amount': 4200.00, 'card': '4111********1111'}
                ],
                'vulnerability_flag': 'BOLA_EXPLOITED_SUCCESS'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'userId': 1001,
                'name': 'CurrentUser',
                'invoices': [{'id': 'INV-01', 'amount': 150.00}]
            }, status=status.HTTP_200_OK)


class BFLAView(APIView):
    """API5:2023 Broken Function Level Authorization Target"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        target_key = request.data.get('target_key_id', 'KEY-SYS-ADMIN-01')
        return Response({
            'status': 'REVOKED',
            'key_id': target_key,
            'revoked_by_role': 'student',
            'bfla_flag': 'EXPLOIT_VERIFIED_SUCCESS'
        }, status=status.HTTP_200_OK)


class MassAssignmentView(APIView):
    """API3:2023 Broken Property Level Authorization Target"""
    permission_classes = [permissions.AllowAny]

    def patch(self, request):
        role_injected = request.data.get('role', 'student')
        return Response({
            'user_id': 'USR-99',
            'name': request.data.get('name', 'Jane Student'),
            'role': role_injected,
            'mass_assignment_flag': 'EXPLOIT_VERIFIED_SUCCESS' if role_injected in ['admin', 'platform_admin'] else 'NORMAL'
        }, status=status.HTTP_200_OK)


class SSRFView(APIView):
    """API7:2023 Server Side Request Forgery Target"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        target_url = request.data.get('url', '')
        if '169.254.169.254' in target_url or 'metadata' in target_url:
            return Response({
                'AccessKeyId': 'ASIAIOSFODNN7EXAMPLE',
                'SecretAccessKey': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
                'Token': 'IQoJb3JpZ2luX2VjEAAA...',
                'ssrf_flag': 'EXPLOIT_VERIFIED_SUCCESS'
            }, status=status.HTTP_200_OK)
        return Response({'status': 'Fetched URL preview successfully'}, status=status.HTTP_200_OK)
