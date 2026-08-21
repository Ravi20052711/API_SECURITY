import json
import subprocess
import os

def cleanup():
    manifest_path = os.path.join(os.path.dirname(__file__), '..', 'infrastructure', 'exercise_manifest.json')
    if not os.path.exists(manifest_path):
        print("Manifest not found.")
        return

    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    print("=== HackTheAPI IaC Container Cleanup ===")
    for ex in manifest['exercises']:
        container_name = ex['container_name']
        print(f"Stopping & Removing {container_name}...")
        subprocess.run(["docker", "stop", container_name], capture_output=True)
        subprocess.run(["docker", "rm", container_name], capture_output=True)

    print("Cleanup complete!")

if __name__ == '__main__':
    cleanup()
