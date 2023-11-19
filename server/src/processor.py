import os
from typing import Dict, Callable, Any
from functools import wraps
import ntpath
from polars.exceptions import PolarsPanicError
from server.src.validator import SqlValidator

from server.src.engine import DataEngine


def handle_exceptions(func: Callable[..., Any]) -> Callable[..., Any]:
    """A decorator for handling exceptions and returning an error response."""

    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except (Exception, PolarsPanicError) as e:
            error_message = f"Error in {func.__name__}: {str(e)}"
            if func.__name__ in ['export_file', 'import_file', 'run_sql']:
                return {'error': error_message}
            elif func.__name__ == 'get_schema':
                return {'schema': {}, 'error': error_message}
            else:
                raise e

    return wrapper


class DataProcessor:
    MAX_ROWS_TO_DISPLAY = 100000
    MAX_COLS_TO_DISPLAY = 200

    def __init__(self, engine: DataEngine, validator: SqlValidator ):
        self.engine = engine
        self.validator = validator
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
        return self.engine.get_schema()

    @handle_exceptions
    def run_sql(self, data: Dict[str, str]):
        """Runs a SQL query and returns the result."""
        sql = data['sql']
        result = self.engine.sql(sql)
        if self.engine.is_empty(result):
            return {'tableData': None, 'columns': None, 'error': None}
        df = self.engine.to_dataframe(
            self.MAX_ROWS_TO_DISPLAY, self.MAX_COLS_TO_DISPLAY, result)
        self.latest_query_result = result
        return {'tableData': df.to_dicts(), 'columns': df.columns, 'error': None}

    def validate(self, data: Dict):
        return self.validator.validate(data)