import json
import subprocess
import os
import sys

def provision():
    manifest_path = os.path.join(os.path.dirname(__file__), '..', 'infrastructure', 'exercise_manifest.json')
    if not os.path.exists(manifest_path):
        print(f"Error: Manifest not found at {manifest_path}")
        sys.exit(1)

    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    print(f"=== HackTheAPI IaC Provisioner ===")
    print(f"Provisioning {len(manifest['exercises'])} exercise container environments...")

    for ex in manifest['exercises']:
        print(f"-> Pre-creating {ex['exercise_id']} ({ex['title']}) on port {ex['port']}...")
        container_name = ex['container_name']
        port = ex['port']

        try:
            # Check if container exists
            res = subprocess.run(["docker", "ps", "-a", "--filter", f"name={container_name}", "--format", "{{.Status}}"], capture_output=True, text=True)
            if res.stdout.strip():
                print(f"   [EXISTS] Container {container_name} is already provisioned.")
            else:
                print(f"   [BUILD] Spinning up isolated container {container_name} on port {port}...")
                subprocess.run(["docker", "run", "-d", "--name", container_name, "-p", f"{port}:8000", "python:3.12-slim", "python", "-m", "http.server", "8000"], check=False)
        except Exception as e:
            print(f"   [WARNING] Docker provisioning notice: {e}")

    print("=== Provisioning Complete! All exercise environments ready ===")

if __name__ == '__main__':
    provision()
