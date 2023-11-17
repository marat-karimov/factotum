import pytest
import ntpath
from glob import glob

from helpers.make_request import make_request
from helpers.start_server import start_server


engines = ["polars", "duckdb"]
test_files = glob("tests/assets/test.*")


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    @pytest.mark.parametrize("file_path", test_files)
    def test_import_file(self, start_server, file_path):
        table_name = ntpath.basename(file_path).split('.')[0]

        # Test import_file endpoint
        import_file_response = make_request(
            "/import_file", {"file_path": file_path})
        assert import_file_response.get('error') is None
        assert import_file_response.get('tableName') == table_name

        # Test run_sql endpoint
        run_sql_response = make_request(
            "/run_sql", {"sql": f"select * from {table_name} limit 1"})
        assert run_sql_response.get('columns')
        assert run_sql_response.get('tableData')
        assert run_sql_response.get('error') is None
