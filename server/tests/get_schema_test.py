import pytest
from glob import glob

from .helpers.make_request import make_request

engines = ["polars", "duckdb"]


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    def test_get_schema_endpoint(self, start_server, import_file):
        """
        Tests the get_schema endpoint.
        Asserts that the response matches the expected response.
        """

        expected_response = {
            "schema": {"test": ["col1", "col2"]},
            "error": None
        }

        response = make_request(
            "/get_schema", {})

        assert response == expected_response
