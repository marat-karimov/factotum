
import polars as pl
from engine import DataEngine
import duckdb
import os

SUPPORTED_EXTENSIONS = ['.csv', '.parquet', '.json', '.tsv']


class DuckDBEngine(DataEngine):
    """DuckDB data engine."""

    def __init__(self):
        self.ctx = duckdb.connect(':default:')
        self.AVOID_LIVE_EVALUATION = ['CREATE', 'DROP', 'DELETE', 'INSERT']
        self.UNSUPPORTED_STATEMENTS = []

    def connect(self) -> duckdb.DuckDBPyConnection:
        return self.ctx

    def register(self, name: str, df: duckdb.DuckDBPyRelation):
        self.ctx.register(name, df)

    def sql(self, query: str):
        return self.ctx.sql(query)

    def is_empty(self, lazyframe: duckdb.DuckDBPyRelation) -> bool:
        return True if not lazyframe else False

    def get_schema(self):
        """Returns the schema of all tables in the SQL context."""
        schema = {}

        tables = self.ctx.sql(
            """
            SELECT table_name as table, list(column_name) as columns
            FROM information_schema.columns
            GROUP BY table_name
               """
        ).fetchall()

        for table in tables:
            schema[table[0]] = table[1]

        return {'schema': schema, 'error': None}

    def read_file(self, file_path: str):
        """Reads a file based on its extension."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file '{file_path}' does not exist.")

        file_extension = os.path.splitext(file_path)[1]

        if file_extension == '.csv':
            return duckdb.read_csv(file_path, header=True)

        if file_extension == '.tsv':
            return duckdb.read_csv(file_path, header=True, sep="\t")

        if file_extension == '.parquet':
            return duckdb.read_parquet(file_path)

        if file_extension == '.json':
            return duckdb.read_json(file_path)

        raise ValueError(
            f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

    def write_file(self, file_path: str, latest_query_result: duckdb.DuckDBPyRelation):

        file_extension = os.path.splitext(file_path)[1]

        if file_extension == '.csv':
            latest_query_result.write_csv(file_path)
            return {'error': None}

        if file_extension == '.tsv':
            latest_query_result.write_csv(file_path, sep="\t")
            return {'error': None}
        
        if file_extension == '.parquet':
            latest_query_result.write_parquet(file_path)
            return {'error': None}
        
        if file_extension == '.json':
            latest_query_result.pl().write_json(file_path, row_oriented=True)
            return {'error': None}

        raise ValueError(
            f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

    def to_dataframe(self, max_rows: int, lazyframe: duckdb.DuckDBPyRelation) -> pl.DataFrame:
        return lazyframe.limit(max_rows).pl()
