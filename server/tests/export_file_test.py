import pytest
import os
import shutil
from glob import glob

from .helpers.make_request import make_request
from .helpers.start_server import start_server
from ..src.read_config import write_formats

engines = ["polars", "duckdb"]
test_files = glob("tests/assets/test.*")


@pytest.fixture(scope="function")
def create_output_dir():
    """
    Fixture to clean up and then create the output directory.
    """
    output_dir = "server/tests/output"

    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

    os.makedirs(output_dir)

    return output_dir


@pytest.fixture(scope="class")
def import_file_and_run_sql(start_server):
    """
    Fixture makes file import and runs sql.
    """
    make_request("/import_file", {"file_path": "tests/assets/test.csv"})
    make_request("/run_sql", {"sql": "select * from test"})


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    @pytest.mark.parametrize("extension", write_formats)
    def test_export_file_endpoint(self, create_output_dir, start_server, import_file_and_run_sql, extension):
        """
        Tests the export_file endpoint.
        Asserts that there is no error in response and that the file was created.
        """

        output_dir = create_output_dir
        file_path = f"{output_dir}/test.{extension}"

        export_file_response = make_request(
            "/export_file", {"file_path": file_path})

        assert export_file_response.get(
            'error') is None, "Error in export_file response"
        assert os.path.exists(
            file_path), f"Exported file not created: {file_path}"
