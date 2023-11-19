import pytest
import os
from glob import glob

from .helpers.make_request import make_request

engines = ["polars", "duckdb"]


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    def test_run_sql_endpoint(self, start_server, import_file):
        """
        Tests the run_sql endpoint to ensure it returns valid data for a given SQL query
        """

        expected_response = {'tableData': [
            {'col1': 'val1', 'col2': 'val2'}], 'columns': ['col1', 'col2'], 'error': None}

        response = make_request(
            "/run_sql", {"sql": f"select * from test limit 1"})

        assert response == expected_response
