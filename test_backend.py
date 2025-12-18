#!/usr/bin/env python3
"""
Test the backend startup and basic functionality
"""
import subprocess
import time
import requests
import sys
import os

def wait_for_server(max_wait=30):
    """Wait for the server to be ready by polling the health endpoint"""
    for i in range(max_wait):
        try:
            response = requests.get("http://localhost:8000/health", timeout=2)
            if response.status_code == 200:
                return True
        except:
            pass
        time.sleep(1)
        print(f"Waiting for server... {i+1}/{max_wait}")
    return False

def test_server():
    """Test the server endpoints after it starts"""
    print("Testing server endpoints...")

    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/health", timeout=10)
        print(f"Health endpoint status: {response.status_code}")
        if response.status_code == 200:
            health_data = response.json()
            print(f"Health response: {health_data}")
        else:
            print(f"Health response: {response.text}")

        # Test root endpoint
        response = requests.get("http://localhost:8000/", timeout=10)
        print(f"Root endpoint status: {response.status_code}")
        if response.status_code == 200:
            root_data = response.json()
            print(f"Root response: {root_data}")
        else:
            print(f"Root response: {response.text}")

        # Test chat endpoint (should work but return error about missing API key)
        response = requests.post(
            "http://localhost:8000/chat",
            json={"query": "test", "selected_text": None},
            timeout=10
        )
        print(f"Chat endpoint status: {response.status_code}")
        if response.status_code == 200:
            chat_data = response.json()
            print(f"Chat response: {chat_data}")
        else:
            print(f"Chat response: {response.text}")

        print("\nAll tests completed successfully!")
        return True

    except Exception as e:
        print(f"Error during testing: {e}")
        return False

if __name__ == "__main__":
    print("Starting backend server...")

    # Start the uvicorn server in the backend directory
    backend_process = subprocess.Popen([
        sys.executable, "-c",
        "import uvicorn; from main import app; uvicorn.run(app, host='0.0.0.0', port=8000)"
    ], cwd="frontend/backend")

    try:
        print("Waiting for server to start...")
        if wait_for_server():
            print("Server is ready!")
            success = test_server()
            if success:
                print("\n[SUCCESS] All functionality tests passed!")
            else:
                print("\n[ERROR] Some tests failed!")
        else:
            print("Server failed to start within timeout period")
    except Exception as e:
        print(f"Error running tests: {e}")
    finally:
        # Terminate the backend process
        print("\nShutting down backend server...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
        print("Backend server stopped.")