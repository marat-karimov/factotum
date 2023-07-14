import os
from typing import Dict, Callable, Any
from functools import wraps
import ntpath
import sqlparse
from polars.exceptions import PolarsPanicError
from flask import jsonify

import sqlglot

from engine import DataEngine


def handle_exceptions(func: Callable[..., Any]) -> Callable[..., Any]:
    """A decorator for handling exceptions and returning an error response."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except (Exception, PolarsPanicError) as e:
            error_message = f"Error in {func.__name__}: {str(e)}"
            if func.__name__ in ['export_file', 'import_file', 'run_sql']:
                return jsonify({'error': error_message})
            elif func.__name__ == 'get_schema':
                return jsonify({'schema': {}, 'error': error_message})
            else:
                raise e

    return wrapper


class DataProcessor:
    MAX_ROWS_TO_DISPLAY = 100000
    MAX_COLS_TO_DISPLAY = 200

    def __init__(self, engine: DataEngine):
        self.engine = engine
        self.latest_query_result = None

    @staticmethod
    def requires_quotes(identifier: str) -> bool:
        reserved_keywords = ['select', 'from',
                             'where', 'insert', 'update', 'delete']

        if identifier.lower() in reserved_keywords:
            return True

        if not identifier.replace('_', '').isalnum() or ' ' in identifier:
            return True

        return False

    @handle_exceptions
    def export_file(self, data: Dict[str, str]):
        """Writes the latest query result to a CSV file."""
        file_path = data["file_path"]
        self.engine.write_file(file_path, self.latest_query_result)
        return {'error': None}

    @handle_exceptions
    def import_file(self, data: Dict[str, str]):
        """Imports a file and registers it in the SQL context."""
        file_path = data["file_path"]
        file_name = os.path.splitext(ntpath.basename(file_path))[0]
        df = self.engine.read_file(file_path)
        self.engine.register(file_name, df)
        tableIdentifier = f'"{file_name}"' if self.requires_quotes(
            file_name) else file_name
        return {'tableName': f'{tableIdentifier}', 'error': None}

    @handle_exceptions
    def get_schema(self, data=None):
        return self.engine.get_schema(max_cols=self.MAX_COLS_TO_DISPLAY)

    @handle_exceptions
    def run_sql(self, data: Dict[str, str]):
        """Runs a SQL query and returns the result."""
        sql = data['sql']
        result = self.engine.sql(sql)
        if self.engine.is_empty(result):
            return jsonify({'tableData': None, 'columns': None, 'error': None})
        df = self.engine.to_dataframe(
            self.MAX_ROWS_TO_DISPLAY, self.MAX_COLS_TO_DISPLAY, result)
        self.latest_query_result = result
        return jsonify({'tableData': df.to_dicts(), 'columns': df.columns, 'error': None})

    def contains_token_type(self, one_statement, token_type_list):
        tokens = sqlparse.parse(one_statement)

        for token in tokens:
            token_type = token.get_type()
            if token_type in token_type_list:
                return token_type

        return False

    def is_write_statement(self, one_statement):
        return bool(self.contains_token_type(one_statement, self.engine.AVOID_LIVE_EVALUATION))

    def is_unsupported_statement(self, one_statement):
        return self.contains_token_type(one_statement, self.engine.UNSUPPORTED_STATEMENTS)

    @staticmethod
    def capitalize_only_first(s: str):
        if len(s) > 0:
            return s[0].upper() + s[1:]
        else:
            return s

    def clean_error(self, error):
        error = str(error)

        substrings_to_replace = [
            '\033[0m', '\033[4m', 'sql parser error:', 'Parser Error:']

        for substr in substrings_to_replace:
            error = error.replace(substr, '')

        error_clean = self.capitalize_only_first(error.strip())

        return error_clean

    def validate_statement_type(self, last_statement: str):
        unsupported_statement = self.is_unsupported_statement(last_statement)

        if unsupported_statement:
            return f'Statement of {unsupported_statement} type is not supported by polars. Try switching to duckdb engine'

        return None

    def format_validation_response(self, result: bool, sql: str, last_statement: str, error: str):
        return {"result": result, 'sql': sql, 'last_statement': last_statement, 'error': error}

    def validate(self, data: Dict) -> Dict:
        sql = data['data']
        sql = sqlparse.format(sql, strip_comments=True)
        statements = sqlparse.split(sql)

        if not statements:
            return self.format_validation_response(False, sql, None, "No SQL statement found")

        last_statement = statements[-1]

        error = self.validate_statement_type(last_statement)
        if error is not None:
            return self.format_validation_response(False, sql, last_statement, error)

        try:
            if self.is_write_statement(last_statement):
                sqlglot.transpile(last_statement)
            else:
                self.engine.sql(last_statement)
        except Exception as e:
            error = self.clean_error(e)
            return self.format_validation_response(False, sql, last_statement, error)

        return self.format_validation_response(True, sql, last_statement, None)
