
import polars as pl
from server.engine import DataEngine
import duckdb
import os
from typing import Callable, Dict
from server.converter import ReadConverter

SUPPORTED_EXTENSIONS = ['.csv', '.parquet', '.xml', ".sav", ".avro", ".dta", ".xpt", ".sas7bcat",
                        '.json', '.tsv', '.feather', ".sas7bdat", ".xls", ".xlsx", ".xlsm", ".xlsb",
                        ".odf", ".ods", ".odt"]

WriterType = Callable[[duckdb.DuckDBPyRelation, str], None]
ReaderType = Callable[[str, ReadConverter], duckdb.DuckDBPyRelation]

READERS: Dict[str, ReaderType] = {
    '.csv': lambda path, conv: duckdb.read_csv(path, header=True),
    '.tsv': lambda path, conv: duckdb.read_csv(path, header=True, sep="\t"),
    '.parquet': duckdb.read_parquet,
    '.json': duckdb.read_json,
    '.xlsx': lambda path, conv: duckdb.read_parquet(conv.excel_to_parquet(path)),
    '.xls': lambda path, conv: duckdb.read_parquet(conv.excel_to_parquet(path)),
    '.xlsm': lambda path, conv: duckdb.read_parquet(conv.excel_to_parquet(path)),
    '.xlsb': lambda path, conv: duckdb.read_parquet(conv.excel_to_parquet(path)),
    '.odf': lambda path, conv: duckdb.read_parquet(conv.excel_to_parquet(path)),
    '.ods': lambda path, conv: duckdb.read_parquet(conv.excel_to_parquet(path)),
    '.odt': lambda path, conv: duckdb.read_parquet(conv.excel_to_parquet(path)),
    '.feather': lambda path, conv: duckdb.read_parquet(conv.feather_to_parquet(path)),
    '.sas7bdat': lambda path, conv: duckdb.read_parquet(conv.sas_to_parquet(path, encoding='utf-8')),
    '.xpt': lambda path, conv: duckdb.read_parquet(conv.sas_to_parquet(path, encoding='utf-8')),
    '.xml': lambda path, conv: duckdb.read_parquet(conv.xml_to_parquet(path)),
    '.sav': lambda path, conv: duckdb.read_parquet(conv.spss_to_parquet(path)),
    '.dta': lambda path, conv: duckdb.read_parquet(conv.stata_to_parquet(path))
}

WRITERS: Dict[str, WriterType] = {
    '.csv': lambda rel, path: rel.write_csv(path, header=True),
    '.tsv': lambda rel, path: rel.write_csv(path, header=True, sep="\t"),
    '.parquet': lambda rel, path: rel.write_parquet(path),
    '.json': lambda rel, path: rel.pl().write_json(path, row_oriented=True),
    '.xlsx': lambda rel, path: rel.pl().write_excel(path),
    '.avro': lambda rel, path: rel.pl().write_avro(path),
    '.feather': lambda rel, path: rel.to_df().to_feather(path, version=1),
    '.xml': lambda rel, path: rel.to_df().to_xml(path, index=False),
    '.dta': lambda rel, path: rel.to_df().to_stata(path, write_index=False),
}


class DuckDBEngine(DataEngine):
    """DuckDB data engine."""

    def __init__(self, converter: ReadConverter):
        self.converter = converter
        self.ctx = duckdb.connect(':memory:')
        self.AVOID_LIVE_EVALUATION = ['CREATE', 'DROP', 'DELETE', 'INSERT']
        self.UNSUPPORTED_STATEMENTS = []
        self.UNSUPPORTED_EXPRESSIONS = []

    def register(self, name: str, df: duckdb.DuckDBPyRelation):
        self.ctx.register(name, df)

    def sql(self, query: str):
        return duckdb.sql(query)

    def is_empty(self, lazyframe: duckdb.DuckDBPyRelation) -> bool:
        return True if not lazyframe else False

    def get_schema(self, max_cols: int):
        """Returns the schema of all tables in the SQL context."""
        schema = {}

        tables = self.sql(
            """
            SELECT table_name as table, list(column_name) as columns
            FROM information_schema.columns
            GROUP BY table_name
               """
        ).fetchall()

        for table in tables:
            cols_to_display = table[1][0: max_cols]
            print('cols to display', len(cols_to_display))
            schema[table[0]] = cols_to_display

        return {'schema': schema, 'error': None}

    def read_file(self, file_path: str) -> duckdb.DuckDBPyRelation:
        """Reads a file based on its extension."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file '{file_path}' does not exist.")

        file_extension = os.path.splitext(file_path)[1]

        if file_extension not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

        rel: duckdb.DuckDBPyRelation = READERS[file_extension](
            file_path, self.converter)

        cols_count = len(rel.columns)

        if cols_count > 100:
            raise Exception(
                f"At the moment, duckdb can't process tables more than 100 columns wide. Use polars engine to import this file")

        return rel

    def write_file(self, file_path: str, latest_query_result: duckdb.DuckDBPyRelation) -> dict:
        """Writes the result of the latest query to a file based on its extension."""
        file_extension = os.path.splitext(file_path)[1]

        if file_extension not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

        WRITERS[file_extension](latest_query_result, file_path)

        return {'error': None}

    def to_dataframe(self, max_rows: int, max_cols: int, lf: duckdb.DuckDBPyRelation) -> pl.DataFrame:
        cols_to_display = lf.columns[0: max_cols]
        return lf.limit(max_rows).pl().select(cols_to_display)
