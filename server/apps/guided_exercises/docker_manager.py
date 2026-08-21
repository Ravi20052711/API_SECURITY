import os
import time
import json
import socket
import subprocess
import logging
import hashlib
import uuid

logger = logging.getLogger(__name__)

# --- CUSTOM CONTROLLED DOCKER EXCEPTIONS ---
class DockerProvisioningException(Exception):
    def __init__(self, message, error_code="DOCKER_PROVISIONING_ERROR", provisioning_state="PROVISIONING_FAILED"):
        super().__init__(message)
        self.message = message
        self.error_code = error_code
        self.provisioning_state = provisioning_state

class DockerDesktopUnavailableException(DockerProvisioningException):
    def __init__(self, message="Docker Desktop is not currently running. Attempting automatic startup..."):
        super().__init__(message, error_code="DOCKER_DESKTOP_INACTIVE", provisioning_state="DOCKER_UNAVAILABLE")

class DockerPermissionException(DockerProvisioningException):
    def __init__(self, message="Permission denied communicating with Docker daemon socket."):
        super().__init__(message, error_code="DOCKER_PERMISSION_ERROR", provisioning_state="DOCKER_UNAVAILABLE")

class DockerContainerCreationException(DockerProvisioningException):
    def __init__(self, message="Failed to create laboratory container environment."):
        super().__init__(message, error_code="CONTAINER_CREATION_FAILED", provisioning_state="PROVISIONING_FAILED")

class DockerHealthCheckException(DockerProvisioningException):
    def __init__(self, message="Laboratory container started but failed health readiness check."):
        super().__init__(message, error_code="HEALTH_CHECK_FAILED", provisioning_state="PROVISIONING_FAILED")


class DockerManager:
    """
    Per-User Dynamic Container Orchestrator with Pre-flight Docker Desktop Availability Detection,
    Automatic Docker Desktop Startup & Boot Waiting, Controlled Error Handling, and Health Readiness Polling.
    """

    MANIFEST_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'infrastructure', 'exercise_manifest.json')
    LAB_SCRIPT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'lab_environment_server.py'))

    @classmethod
    def check_docker_availability(cls):
        """
        State Machine Pre-flight Check:
        REQUESTED -> CHECKING_DOCKER -> DOCKER_AVAILABLE / AUTO_STARTING_DOCKER -> DOCKER_AVAILABLE
        Verifies that Docker Desktop daemon is active, reachable, and capable of running containers.
        If Docker Desktop is inactive, automatically triggers startup and waits up to 60 seconds.
        """
        # 1. Quick check if Docker Desktop is ALREADY running
        try:
            res = subprocess.run(["docker", "info"], capture_output=True, text=True, timeout=5)
            if res.returncode == 0:
                return {"status": "DOCKER_AVAILABLE", "available": True}
        except Exception:
            pass

        # 2. Docker Desktop is inactive -> Trigger automatic startup
        logger.info("[DOCKER AUTO-START] Docker Desktop is inactive. Attempting automatic launch...")
        try:
            docker_paths = [
                r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
                r"C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe"
            ]
            started = False
            for path in docker_paths:
                if os.path.exists(path):
                    subprocess.Popen(["powershell", "-Command", f"Start-Process '{path}'"])
                    started = True
                    break

            if not started:
                subprocess.Popen(["powershell", "-Command", "Start-Process 'Docker Desktop'"])
        except Exception as e:
            logger.warning(f"[DOCKER AUTO-START] Launch command notice: {e}")

        # 3. Wait up to 60 seconds (30 attempts * 2s) for Docker Desktop daemon to initialize
        logger.info("[DOCKER AUTO-WAIT] Waiting up to 60 seconds for Docker Desktop daemon to boot up...")
        for attempt in range(1, 31):
            time.sleep(2)
            try:
                res_poll = subprocess.run(["docker", "info"], capture_output=True, text=True, timeout=5)
                if res_poll.returncode == 0:
                    logger.info(f"[DOCKER AUTO-START SUCCESS] Docker Desktop initialized & ready after {attempt * 2}s!")
                    return {"status": "DOCKER_AVAILABLE", "available": True, "auto_started": True}
            except Exception:
                pass

        # 4. If still unreachable after 60s, raise exception with clear status
        raise DockerDesktopUnavailableException(
            "Docker Desktop was automatically launched, but took longer than 60 seconds to boot up. Please check Docker Desktop in your taskbar and try provisioning again."
        )

    @classmethod
    def _load_manifest(cls):
        try:
            if os.path.exists(cls.MANIFEST_PATH):
                with open(cls.MANIFEST_PATH, 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading exercise manifest: {e}")
        return None

    @classmethod
    def find_available_port(cls, start_port=8100, max_port=8999):
        used_ports = set()
        try:
            res = subprocess.run(["docker", "ps", "--format", "{{.Ports}}"], capture_output=True, text=True)
            for line in res.stdout.splitlines():
                for part in line.split(','):
                    if '->' in part and ':' in part:
                        try:
                            port_str = part.split('->')[0].split(':')[-1]
                            used_ports.add(int(port_str))
                        except Exception:
                            pass
        except Exception as e:
            logger.warning(f"Error checking docker ports: {e}")

        for port in range(start_port, max_port):
            if port in used_ports:
                continue
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.1)
                res = s.connect_ex(('127.0.0.1', port))
                if res != 0:
                    return port

        return start_port + 50

    @classmethod
    def is_container_alive(cls, container_name):
        if not container_name:
            return False
        try:
            res = subprocess.run(["docker", "ps", "--filter", f"name={container_name}", "--format", "{{.Names}}"], capture_output=True, text=True)
            return container_name in res.stdout
        except Exception:
            return False

    @classmethod
    def ensure_container_alive(cls, container_name, assigned_port, session_id, user_email, exercise_id):
        # 1. Pre-flight check with auto-start capability
        cls.check_docker_availability()

        # 2. Check if running
        if cls.is_container_alive(container_name):
            return {"container_name": container_name, "port": assigned_port, "status": "RUNNING", "healed": False}

        # 3. Check if stopped but exists
        try:
            res_all = subprocess.run(["docker", "ps", "-a", "--filter", f"name={container_name}", "--format", "{{.Names}}"], capture_output=True, text=True)
            if container_name in res_all.stdout:
                subprocess.run(["docker", "start", container_name], capture_output=True)
                logger.info(f"Re-started stopped container {container_name}")
                return {"container_name": container_name, "port": assigned_port, "status": "RESTARTED", "healed": True}
        except Exception:
            pass

        # 4. Re-provision fresh container running real PortSwigger Vulnerable API Server
        try:
            mount_arg = f"{cls.LAB_SCRIPT_PATH}:/app/lab_environment_server.py"
            run_res = subprocess.run([
                "docker", "run", "-d",
                "--name", container_name,
                "--memory=512m",
                "-v", mount_arg,
                "-e", f"SESSION_ID={session_id}",
                "-e", f"USER_EMAIL={user_email}",
                "-e", f"EXERCISE_ID={exercise_id}",
                "-p", f"{assigned_port}:8000",
                "python:3.12-slim",
                "python", "/app/lab_environment_server.py", "8000", exercise_id, session_id
            ], capture_output=True, text=True)

            if run_res.returncode != 0:
                logger.error(f"Docker run failed with code {run_res.returncode}: {run_res.stderr}")
                raise DockerContainerCreationException(f"Failed to create laboratory container: {run_res.stderr}")

            logger.info(f"Re-provisioned PortSwigger Vulnerable Container {container_name} on port {assigned_port}")
            return {"container_name": container_name, "port": assigned_port, "status": "REPROVISIONED", "healed": True}
        except DockerProvisioningException:
            raise
        except Exception as e:
            logger.error(f"Failed to re-provision container {container_name}: {e}")
            raise DockerContainerCreationException(f"Failed to provision laboratory container: {str(e)}")

    @classmethod
    def create_per_user_container(cls, session_id, user_email, exercise_id):
        cls.check_docker_availability()

        user_hash = hashlib.md5(user_email.encode('utf-8')).hexdigest()[:6]
        short_uuid = uuid.uuid4().hex[:6]
        clean_ex = exercise_id.replace('-', '_')
        container_name = f"hacktheapi_sess_{user_hash}_{clean_ex}_{short_uuid}"

        assigned_port = cls.find_available_port(start_port=8100)

        res = cls.ensure_container_alive(container_name, assigned_port, session_id, user_email, exercise_id)
        return {
            'container_name': container_name,
            'port': assigned_port,
            'status': res['status'],
            'healed': res['healed']
        }

    @classmethod
    def stop_and_remove_container(cls, container_name):
        if not container_name:
            return
        try:
            subprocess.run(["docker", "stop", "-t", "1", container_name], capture_output=True)
            subprocess.run(["docker", "rm", "-f", container_name], capture_output=True)
            logger.info(f"Cleaned up container {container_name}")
        except Exception as e:
            logger.warning(f"Container cleanup notice for {container_name}: {e}")
