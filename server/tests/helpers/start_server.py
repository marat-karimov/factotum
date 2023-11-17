import pytest
import subprocess
import time


@pytest.fixture(scope="class")
def start_server(request):
    engine = request.param
    server = subprocess.Popen(
        ["./micromamba/envs/venv/bin/python", "main.py", engine])

    # TODO: Implement a robust server readiness check here
    time.sleep(1)

    yield server

    server.terminate()
    server.wait()
