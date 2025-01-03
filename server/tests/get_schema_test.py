import pytest

from .helpers.make_request import make_request
from server.src.read_config import filename_column

engines = ["polars", "duckdb"]


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    def test_get_schema_endpoint(self, start_server, import_file):
        """
        Tests the get_schema endpoint.
        Asserts that the response matches the expected response.
        """

        expected_cols = ["col1", "col2", filename_column]

        expected_response = {
            "schema": {"test": expected_cols},
            "error": None
        }

        response = make_request(
            "/get_schema", {})

        assert response == expected_response
