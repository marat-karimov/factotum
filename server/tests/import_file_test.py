import pytest
import os
from glob import glob

from .helpers.make_request import make_request
from .helpers.start_server import start_server

engines = ["polars", "duckdb"]
test_files = glob("tests/assets/test.*")


@pytest.fixture(scope="function")
def import_file(start_server, request):
    """
    Fixture to handle the import of a file. Asserts successful file import and correct table naming.
    """
    file_path = request.param
    table_name = os.path.basename(file_path).split('.')[0]

    response = make_request("/import_file", {"file_path": file_path})
    assert response.get('error') is None, "Error in import_file response"
    assert response.get(
        'tableName') == table_name, "tableName mismatch in import_file response"

    return table_name


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    @pytest.mark.parametrize("import_file", test_files, indirect=True)
    def test_run_sql_endpoint(self, start_server, import_file):
        """
        Tests the run_sql endpoint to ensure it returns valid data for a given SQL query
        """
        table_name = import_file

        run_sql_response = make_request(
            "/run_sql", {"sql": f"select * from {table_name} limit 1"})
        assert run_sql_response.get(
            'columns'), "No columns in run_sql response"
        assert run_sql_response.get(
            'tableData'), "No tableData in run_sql response"
        assert run_sql_response.get(
            'error') is None, "Error in run_sql response"
