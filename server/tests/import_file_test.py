import pytest
import os
from glob import glob

from .helpers.make_request import make_request

engines = ["polars", "duckdb"]
test_files = glob("tests/assets/test.*")


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    @pytest.mark.parametrize("file_path", test_files)
    def test_import_file_endpoint(self, start_server, file_path):

        table_name = os.path.basename(file_path).split('.')[0]

        response = make_request("/import_file", {"file_path": file_path})

        assert response.get('error') is None, "Error in import_file response"
        assert response.get(
            'tableName') == table_name, "tableName mismatch in import_file response"
