import pytest
import subprocess
import time
import sys

venv_dir = "./micromamba/envs/venv"
python_exec = f"{venv_dir}/python" if sys.platform == 'win32' else f"{venv_dir}/bin/python"


@pytest.fixture(scope="class")
def start_server(request):
    engine = request.param
    server = subprocess.Popen([python_exec, "main.py", engine])

    # TODO: Implement a robust server readiness check here
    time.sleep(1)

    yield server

    server.terminate()
    server.wait()
