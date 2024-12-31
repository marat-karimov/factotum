import pytest

from .helpers.make_request import make_request

engines = ["polars", "duckdb"]


@pytest.mark.parametrize("start_server", engines, indirect=True)
class TestEngine:
    def test_validate_endpoint_correct_sql(self, start_server, import_file):
        """
        Tests the validate endpoint with correct sql query.
        """

        sql = "--comment\nselect * from test2; select * from test"

        response = make_request("/validate", {"data": sql})

        assert response.get('result')
        assert response.get('last_statement') == "select * from test"
        assert response.get('sql') == "select * from test2;select * from test"
        assert response.get('error') is None

    def test_validate_endpoint_wrong_sql(self, start_server, import_file):
        """
        Tests the validate endpoint with wrong sql query.
        """

        sql = "--comment\nselect * from test2; select * from test1"

        response = make_request("/validate", {"data": sql})

        assert response.get('result') is False
        assert response.get('last_statement') == "select * from test1"
        assert response.get('sql') == "select * from test2;select * from test1"
        assert response.get('error')
