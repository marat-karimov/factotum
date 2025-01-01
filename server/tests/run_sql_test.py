import pytest
from .helpers.make_request import make_request
from server.src.read_config import filename_column

engines = ["polars", "duckdb"]


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    def test_run_sql_endpoint(self, start_server, import_file):
        """
        Tests the run_sql endpoint to ensure it returns valid data for a given SQL query
        """

        expected_cols = ['col1', 'col2', filename_column]
        expected_data = {'col1': 'val1', 'col2': 'val2', filename_column: import_file}

        expected_response = {'tableData': [expected_data], 'columns': expected_cols, 'error': None}

        response = make_request(
            '/run_sql', {'sql': f'select * from test limit 1'})

        assert response == expected_response
