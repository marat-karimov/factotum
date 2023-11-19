import pytest
import subprocess
import sys

from .helpers.make_request import make_request

venv_dir = "./micromamba/envs/venv"
python_exec = f"{venv_dir}/python" if sys.platform == 'win32' else f"{venv_dir}/bin/python"


@pytest.fixture(scope="class")
def start_server(request):
    engine = request.param
    server = subprocess.Popen(
        [python_exec, "main.py", engine], stdout=subprocess.PIPE, text=True, bufsize=1)

    # Wait until server is ready
    for line in iter(server.stdout.readline, ''):
        if "Starting Factotum server" in line:
            break

    yield server

    server.terminate()
    server.wait()


@pytest.fixture(scope="class")
def import_file(start_server):
    """
    Fixture makes file import.
    """
    make_request("/import_file", {"file_path": "tests/assets/test.csv"})
