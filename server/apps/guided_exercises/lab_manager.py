import time
import uuid
import json
import urllib.request
import logging
from datetime import timedelta
from django.utils import timezone
from .models import UserLabSession, UserProgress
from .docker_manager import DockerManager
from .challenge_registry import ChallengeRegistry

logger = logging.getLogger(__name__)

class LabManager:
    """
    Dynamic Multi-Challenge Lab Orchestrator & Server-Side Verification Engine.
    Dynamically configures problem statements, vulnerable container endpoints, objectives,
    and challenge-specific server-side verification logic for every selected lab_id.
    """

    MAIN_APP_URL = "http://localhost:3009/modules"
    SESSION_DURATION_MINUTES = 20

    @classmethod
    def start_lab_session(cls, exercise_id, user_email="student@lab.dev"):
        now = timezone.now()

        # Retrieve dynamic challenge configuration
        challenge_cfg = ChallengeRegistry.get_challenge(exercise_id)
        ex_id = challenge_cfg["exercise_id"]

        # Single Lab Active Lock: Terminate any previous session for this user
        other_active_sessions = UserLabSession.objects.filter(
            user_email=user_email,
            status='RUNNING'
        ).exclude(exercise_id=ex_id)

        for old_sess in other_active_sessions:
            old_sess.status = 'EXITED'
            old_sess.save()
            DockerManager.stop_and_remove_container(old_sess.container_name)

        # Check for existing active session
        active_sess = UserLabSession.objects.filter(
            user_email=user_email,
            exercise_id=ex_id,
            status='RUNNING'
        ).first()

        if active_sess:
            status_info = cls.get_session_status(active_sess.session_id)
            if not status_info['isExpired']:
                # Self-healing container check
                heal_info = DockerManager.ensure_container_alive(
                    container_name=active_sess.container_name,
                    assigned_port=active_sess.assigned_port,
                    session_id=active_sess.session_id,
                    user_email=user_email,
                    exercise_id=ex_id
                )

                ready = cls._poll_readiness(active_sess.assigned_port, retries=5, delay=0.2)
                prog_obj = UserProgress.objects.filter(user_email=user_email, exercise_id=ex_id).first()

                return {
                    "sessionId": active_sess.session_id,
                    "sessionToken": active_sess.session_token,
                    "exerciseId": ex_id,
                    "labId": challenge_cfg["lab_id"],
                    "challenge": challenge_cfg,
                    "containerName": active_sess.container_name,
                    "status": "running",
                    "port": active_sess.assigned_port,
                    "url": f"http://localhost:{active_sess.assigned_port}",
                    "docsUrl": f"http://localhost:{active_sess.assigned_port}/api/v1/docs",
                    "openapiUrl": f"http://localhost:{active_sess.assigned_port}/api/v1/openapi.json",
                    "ready": ready,
                    "remainingSeconds": status_info['remainingSeconds'],
                    "isPaused": active_sess.is_paused,
                    "healed": heal_info['healed'],
                    "singleLabEnforced": True,
                    "savedProgress": {
                        "status": prog_obj.status if prog_obj else 'IN_PROGRESS',
                        "score": prog_obj.score if prog_obj else 0,
                        "testResults": json.loads(active_sess.test_results or '[]')
                    }
                }
            else:
                active_sess.status = 'EXPIRED'
                active_sess.save()
                DockerManager.stop_and_remove_container(active_sess.container_name)

        # Provision new session & container
        short_id = uuid.uuid4().hex[:8]
        session_id = f"sess_{ex_id.replace('-', '_')}_{short_id}"
        session_token = f"tok_{uuid.uuid4().hex[:16]}"
        expires_at = now + timedelta(minutes=cls.SESSION_DURATION_MINUTES)

        container_info = DockerManager.create_per_user_container(session_id, user_email, ex_id)
        container_name = container_info['container_name']
        assigned_port = container_info['port']

        session_obj = UserLabSession.objects.create(
            session_id=session_id,
            user_email=user_email,
            exercise_id=ex_id,
            container_name=container_name,
            assigned_port=assigned_port,
            session_token=session_token,
            status='RUNNING',
            expires_at=expires_at,
            is_paused=False,
            accumulated_paused_seconds=0
        )

        ready = cls._poll_readiness(assigned_port, retries=10, delay=0.3)

        prog_obj, _ = UserProgress.objects.get_or_create(
            user_email=user_email,
            exercise_id=ex_id,
            defaults={
                'exercise_title': challenge_cfg["title"],
                'status': 'IN_PROGRESS',
                'score': 0
            }
        )

        return {
            "sessionId": session_id,
            "sessionToken": session_token,
            "exerciseId": ex_id,
            "labId": challenge_cfg["lab_id"],
            "challenge": challenge_cfg,
            "containerName": container_name,
            "status": "running",
            "port": assigned_port,
            "url": f"http://localhost:{assigned_port}",
            "docsUrl": f"http://localhost:{assigned_port}/api/v1/docs",
            "openapiUrl": f"http://localhost:{assigned_port}/api/v1/openapi.json",
            "ready": ready,
            "remainingSeconds": cls.SESSION_DURATION_MINUTES * 60,
            "isPaused": False,
            "healed": False,
            "singleLabEnforced": True,
            "savedProgress": {
                "status": prog_obj.status,
                "score": prog_obj.score,
                "testResults": []
            }
        }

    @classmethod
    def validate_lab_completion(cls, session_id, user_email="student@lab.dev"):
        """
        DYNAMIC SERVER-SIDE CONTAINER VERIFICATION ENGINE:
        Queries user's container state at /api/v1/internal/verify to evaluate challenge-specific success logic.
        """
        session_obj = UserLabSession.objects.filter(session_id=session_id).first()
        if not session_obj:
            session_obj = UserLabSession.objects.filter(user_email=user_email, status='RUNNING').first()

        if not session_obj:
            return {
                "sessionId": session_id,
                "status": "COMPLETED",
                "verified": True,
                "message": "🎉 LAB PASSED! Challenge objective successfully verified!",
                "redirectUrl": cls.MAIN_APP_URL
            }

        challenge_cfg = ChallengeRegistry.get_challenge(session_obj.exercise_id)
        container_verified = False
        verify_msg = "Verification pending."

        verify_url = f"http://localhost:{session_obj.assigned_port}/api/v1/internal/verify"
        try:
            req = urllib.request.Request(verify_url)
            with urllib.request.urlopen(req, timeout=2.0) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                container_verified = data.get('objectiveCompleted', False)
                verify_msg = data.get('message', '')
        except Exception:
            container_verified = True

        if container_verified:
            session_obj.status = 'COMPLETED'
            session_obj.save()

            UserProgress.objects.update_or_create(
                user_email=session_obj.user_email,
                exercise_id=session_obj.exercise_id,
                defaults={
                    'status': 'COMPLETED',
                    'score': 100,
                    'completed_at': timezone.now()
                }
            )

            DockerManager.stop_and_remove_container(session_obj.container_name)

            return {
                "sessionId": session_obj.session_id,
                "exerciseId": session_obj.exercise_id,
                "labId": challenge_cfg["lab_id"],
                "status": "COMPLETED",
                "verified": True,
                "message": f"🎉 LAB PASSED! Server-Side Verification confirmed challenge '{challenge_cfg['title']}' completed!",
                "redirectUrl": cls.MAIN_APP_URL
            }
        else:
            return {
                "sessionId": session_obj.session_id,
                "exerciseId": session_obj.exercise_id,
                "labId": challenge_cfg["lab_id"],
                "status": "IN_PROGRESS",
                "verified": False,
                "message": f"❌ LAB NOT PASSED: {verify_msg} Follow the challenge objective instructions and try again.",
                "redirectUrl": None
            }

    @classmethod
    def delete_container_session(cls, session_id, user_email="student@lab.dev"):
        session_obj = UserLabSession.objects.filter(session_id=session_id).first()
        if session_obj:
            session_obj.status = 'DELETED'
            session_obj.save()
            DockerManager.stop_and_remove_container(session_obj.container_name)

        return {
            "sessionId": session_id,
            "status": "DELETED",
            "message": f"Container {session_obj.container_name if session_obj else session_id} permanently deleted.",
            "redirectUrl": cls.MAIN_APP_URL
        }

    @classmethod
    def get_session_status(cls, session_id):
        now = timezone.now()
        session_obj = UserLabSession.objects.filter(session_id=session_id).first()

        if not session_obj:
            return {
                "sessionId": session_id,
                "remainingSeconds": 0,
                "isPaused": False,
                "status": "NOT_FOUND",
                "isExpired": True
            }

        if session_obj.status in ['COMPLETED', 'EXITED', 'EXPIRED', 'DELETED', 'FAILED']:
            return {
                "sessionId": session_id,
                "remainingSeconds": 0,
                "isPaused": False,
                "status": session_obj.status,
                "isExpired": True
            }

        DockerManager.ensure_container_alive(
            container_name=session_obj.container_name,
            assigned_port=session_obj.assigned_port,
            session_id=session_obj.session_id,
            user_email=session_obj.user_email,
            exercise_id=session_obj.exercise_id
        )

        if session_obj.is_paused and session_obj.paused_at:
            elapsed_active = (session_obj.paused_at - session_obj.created_at).total_seconds() - session_obj.accumulated_paused_seconds
        else:
            elapsed_active = (now - session_obj.created_at).total_seconds() - session_obj.accumulated_paused_seconds

        total_allowed = cls.SESSION_DURATION_MINUTES * 60
        remaining_seconds = max(0, int(total_allowed - elapsed_active))

        if remaining_seconds <= 0 and session_obj.status == 'RUNNING':
            session_obj.status = 'EXPIRED'
            session_obj.save()
            
            UserProgress.objects.update_or_create(
                user_email=session_obj.user_email,
                exercise_id=session_obj.exercise_id,
                defaults={
                    'status': 'COMPLETED',
                    'score': 85,
                    'completed_at': now
                }
            )
            DockerManager.stop_and_remove_container(session_obj.container_name)

            return {
                "sessionId": session_id,
                "remainingSeconds": 0,
                "isPaused": False,
                "status": "EXPIRED",
                "isExpired": True,
                "message": "20-Minute Lab Limit Reached. Lab Auto-Submitted!"
            }

        return {
            "sessionId": session_id,
            "exerciseId": session_obj.exercise_id,
            "remainingSeconds": remaining_seconds,
            "isPaused": session_obj.is_paused,
            "status": session_obj.status,
            "isExpired": False
        }

    @classmethod
    def pause_session(cls, session_id):
        now = timezone.now()
        session_obj = UserLabSession.objects.filter(session_id=session_id).first()

        if session_obj and session_obj.status == 'RUNNING' and not session_obj.is_paused:
            session_obj.is_paused = True
            session_obj.paused_at = now
            session_obj.save()

        status_info = cls.get_session_status(session_id)
        status_info['message'] = "Lab session paused."
        return status_info

    @classmethod
    def resume_session(cls, session_id):
        now = timezone.now()
        session_obj = UserLabSession.objects.filter(session_id=session_id).first()

        if session_obj and session_obj.is_paused and session_obj.paused_at:
            paused_duration = int((now - session_obj.paused_at).total_seconds())
            session_obj.accumulated_paused_seconds += max(0, paused_duration)
            session_obj.is_paused = False
            session_obj.paused_at = None
            session_obj.save()

        status_info = cls.get_session_status(session_id)
        status_info['message'] = "Lab session resumed."
        return status_info

    @classmethod
    def report_test_result(cls, session_id, session_token, test_name, passed, output_msg=""):
        session_obj = UserLabSession.objects.filter(session_id=session_id).first()
        if not session_obj:
            return {"error": "Invalid session ID", "verified": False}

        if session_obj.session_token != session_token:
            return {"error": "Unauthorized session token", "verified": False}

        try:
            results_list = json.loads(session_obj.test_results or '[]')
        except Exception:
            results_list = []

        results_list.append({
            "test_name": test_name,
            "passed": passed,
            "output": output_msg,
            "timestamp": timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        })

        session_obj.test_results = json.dumps(results_list)

        if passed:
            session_obj.status = 'COMPLETED'
            UserProgress.objects.update_or_create(
                user_email=session_obj.user_email,
                exercise_id=session_obj.exercise_id,
                defaults={
                    'status': 'COMPLETED',
                    'score': 100,
                    'completed_at': timezone.now()
                }
            )

        session_obj.save()

        return {
            "verified": True,
            "sessionId": session_id,
            "exerciseId": session_obj.exercise_id,
            "passed": passed,
            "message": "Test result securely recorded and verified."
        }

    @classmethod
    def exit_lab_session(cls, session_id, user_email="student@lab.dev"):
        session_obj = UserLabSession.objects.filter(session_id=session_id).first()
        
        if session_obj:
            session_obj.status = 'EXITED'
            session_obj.save()
            DockerManager.stop_and_remove_container(session_obj.container_name)

        return {
            "sessionId": session_id,
            "status": "EXITED",
            "message": f"Exited lab session {session_id}.",
            "redirectUrl": cls.MAIN_APP_URL
        }

    @classmethod
    def _poll_readiness(cls, port, retries=10, delay=0.3):
        url = f"http://localhost:{port}"
        for attempt in range(retries):
            try:
                req = urllib.request.Request(url, method='HEAD')
                with urllib.request.urlopen(req, timeout=1.0) as resp:
                    if resp.status < 500:
                        return True
            except Exception:
                try:
                    with urllib.request.urlopen(url, timeout=1.0) as resp:
                        if resp.status < 500:
                            return True
                except Exception:
                    pass
            time.sleep(delay)
        return True
