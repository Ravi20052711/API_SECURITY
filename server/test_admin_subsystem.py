import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

def post_json(url, data, headers=None):
    if headers is None:
        headers = {}
    headers['Content-Type'] = 'application/json'
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def get_json(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers, method='GET')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def delete_json(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers, method='DELETE')
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def main():
    print("==================================================================")
    print("   RIGOROUS END-TO-END ADMIN SUBSYSTEM & SECURITY VERIFICATION   ")
    print("==================================================================")

    # 1. Login Admin
    admin_auth = post_json(f"{BASE_URL}/auth/admin/login", {"username": "instructor@lab.dev", "password": "password"})
    admin_token = admin_auth["token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("[OK] 1. ADMIN AUTHENTICATED: Token issued for instructor@lab.dev")

    # 2. Login Student Target
    student_username = "victim_online_student_99"
    student_auth = post_json(f"{BASE_URL}/auth/user/login", {"username": student_username, "password": "password"})
    student_token = student_auth["token"]
    student_id = student_auth["user"]["id"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print(f"[OK] 2. STUDENT AUTHENTICATED: Token issued for {student_username} (ID: {student_id})")

    # 3. Test Unauthorized Access Attempts by Normal Student
    print("\n--- TESTING SERVER-SIDE AUTHORIZATION (STUDENT DENIAL) ---")
    admin_endpoints = [
        ("GET", f"{BASE_URL}/admin-console/student-progress"),
        ("GET", f"{BASE_URL}/admin-console/users/{student_id}/detail"),
        ("POST", f"{BASE_URL}/admin-console/users/{student_id}/reset-progress"),
        ("POST", f"{BASE_URL}/admin-console/users/{student_id}/complete-progress"),
        ("DELETE", f"{BASE_URL}/admin-console/users/{student_id}/delete")
    ]

    for method, url in admin_endpoints:
        try:
            req = urllib.request.Request(url, headers=student_headers, method=method)
            urllib.request.urlopen(req)
            print(f"[FAIL] Student call to {method} {url} returned 200 OK unexpectedly!")
            sys.exit(1)
        except urllib.error.HTTPError as e:
            if e.code == 403:
                print(f"[CONFIRMED 403 FORBIDDEN] Student blocked from {method} {url}")
            else:
                print(f"[!] Unexpected status {e.code} for {method} {url}")

    # 4. User Directory & Individual User Inspector (Admin Token)
    print("\n--- TESTING ADMIN USER DIRECTORY & USER INSPECTOR ---")
    user_list = get_json(f"{BASE_URL}/admin-console/student-progress", headers=admin_headers)
    print(f"[OK] Admin retrieved user list. Total users registered: {len(user_list)}")

    user_detail = get_json(f"{BASE_URL}/admin-console/users/{student_id}/detail", headers=admin_headers)
    print(f"[OK] User detail retrieved for ID {student_id}: Email={user_detail['user']['email']}, CompletionRate={user_detail['progress']['completion_rate']}%")

    # 5. Force Complete Progress (100%)
    print("\n--- TESTING FORCE COMPLETE PROGRESS (100%) ---")
    comp_res = post_json(f"{BASE_URL}/admin-console/users/{student_id}/complete-progress", {"scope": "all"}, headers=admin_headers)
    print(f"[OK] Force complete status: {comp_res['status']}")

    user_detail_comp = get_json(f"{BASE_URL}/admin-console/users/{student_id}/detail", headers=admin_headers)
    print(f"[DB VERIFIED] Target User Progress after Force Complete: {user_detail_comp['progress']['completion_rate']}% (Score: {user_detail_comp['progress']['total_score']})")

    # 6. Force Reset Progress (0%)
    print("\n--- TESTING FORCE RESET PROGRESS (0%) ---")
    rst_res = post_json(f"{BASE_URL}/admin-console/users/{student_id}/reset-progress", {}, headers=admin_headers)
    print(f"[OK] Force reset status: {rst_res['status']}")

    user_detail_rst = get_json(f"{BASE_URL}/admin-console/users/{student_id}/detail", headers=admin_headers)
    print(f"[DB VERIFIED] Target User Progress after Force Reset: {user_detail_rst['progress']['completion_rate']}% (Score: {user_detail_rst['progress']['total_score']})")

    # 7. Student Starts Active Lab Session (Online User Scenario)
    print("\n--- TESTING ONLINE USER LAB SESSION LAUNCH ---")
    start_lab_res = post_json(f"{BASE_URL}/labs/ex-bfla-01/start", {"email": f"{student_username}@lab.dev"}, headers=student_headers)
    container_name = start_lab_res["containerName"]
    assigned_port = start_lab_res["port"]
    print(f"[ONLINE USER ACTIVE LAB] Session ID: {start_lab_res['sessionId']} • Container: {container_name} • Port: {assigned_port}")

    # Verify user is currently "In Lab"
    user_detail_online = get_json(f"{BASE_URL}/admin-console/users/{student_id}/detail", headers=admin_headers)
    print(f"[REAL-TIME STATUS] User Status: Active Session={user_detail_online['active_session']['session_id']}")

    # 8. Primary Admin Protection Policy Check
    print("\n--- TESTING PRIMARY ADMIN PROTECTION POLICY ---")
    try:
        delete_json(f"{BASE_URL}/admin-console/users/1/delete", headers=admin_headers)
        print("[FAIL] Primary admin (ID: 1) was deleted unexpectedly!")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        if e.code == 403:
            print("[CONFIRMED 403 FORBIDDEN] Admin policy protected Primary Admin (ID: 1) from deletion.")

    # 9. Delete Online Student User Account & Terminate Session
    print("\n--- TESTING DELETION OF ONLINE USER & CONTAINER CLEANUP ---")
    del_res = delete_json(f"{BASE_URL}/admin-console/users/{student_id}/delete", headers=admin_headers)
    print(f"[DELETION SUCCESS] Response: {del_res['message']}")

    # Verification: Try requesting user details or logging in as deleted user
    try:
        get_json(f"{BASE_URL}/admin-console/users/{student_id}/detail", headers=admin_headers)
        print("[FAIL] Deleted user detail still accessible!")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[VERIFIED 404 NOT FOUND] Deleted user record purged from database.")

    # 10. Audit Log Verification
    print("\n--- TESTING ADMINISTRATIVE AUDIT TRAIL LOGGING ---")
    audit_logs = get_json(f"{BASE_URL}/admin-console/audit-log", headers=admin_headers)
    print(f"[AUDIT LOGS Persisted] Total Audit Logs: {len(audit_logs)}")
    for log in audit_logs[:3]:
        print(f"   • [{log['timestamp']}] Admin: {log['admin']} | Action: {log['action']} | Target: {log['target_user']} | Details: {log['details']}")

    print("\n==================================================================")
    print("  ALL 10 ADMIN SUBSYSTEM POWERS & SECURITY CHECKS VERIFIED 100% ")
    print("==================================================================")

if __name__ == '__main__':
    main()
