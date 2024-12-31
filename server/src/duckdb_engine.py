
import polars as pl
from server.src.engine import DataEngine
import duckdb
from typing import Callable, Dict
from server.src.converter import ReadConverter
from server.src.read_config import read_formats, write_formats
import pandavro as pdx
from server.src.orc import write_orc
import os

WriterType = Callable[[duckdb.DuckDBPyRelation, str], None]
ReaderType = Callable[[str, ReadConverter], duckdb.DuckDBPyRelation]

READERS: Dict[str, ReaderType] = {
    'csv': lambda path, conv: duckdb.read_csv(path, header=True, filename=True),
    'tsv': lambda path, conv: duckdb.read_csv(path, header=True, sep="\t"),
    'parquet': lambda path, conv: duckdb.read_parquet(path),
    'json': lambda path, conv: duckdb.read_json(path),
    'avro': lambda path, conv: duckdb.read_csv(conv.avro_to_csv(path)),
    'orc': lambda path, conv: duckdb.read_csv(conv.orc_to_csv(path)),
    'xlsx': lambda path, conv: duckdb.read_csv(conv.excel_to_csv(path)),
    'xls': lambda path, conv: duckdb.read_csv(conv.excel_to_csv(path)),
    'xlsm': lambda path, conv: duckdb.read_csv(conv.excel_to_csv(path)),
    'xlsb': lambda path, conv: duckdb.read_csv(conv.excel_to_csv(path)),
    'odf': lambda path, conv: duckdb.read_csv(conv.excel_to_csv(path)),
    'ods': lambda path, conv: duckdb.read_csv(conv.excel_to_csv(path)),
    'odt': lambda path, conv: duckdb.read_csv(conv.excel_to_csv(path)),
    'feather': lambda path, conv: duckdb.read_csv(conv.feather_to_csv(path)),
    'sas7bdat': lambda path, conv: duckdb.read_csv(conv.sas_to_csv(path, encoding='utf-8')),
    'xpt': lambda path, conv: duckdb.read_csv(conv.sas_to_csv(path, encoding='utf-8')),
    'xml': lambda path, conv: duckdb.read_csv(conv.xml_to_csv(path)),
    'sav': lambda path, conv: duckdb.read_csv(conv.spss_to_csv(path)),
    'dta': lambda path, conv: duckdb.read_csv(conv.stata_to_csv(path, convert_categoricals=False)),
    'h5': lambda path, conv: duckdb.read_csv(conv.hdf_to_csv(path)),
    'hdf5': lambda path, conv: duckdb.read_csv(conv.hdf_to_csv(path))
}

WRITERS: Dict[str, WriterType] = {
    'csv': lambda rel, path: rel.write_csv(path, header=True),
    'tsv': lambda rel, path: rel.write_csv(path, header=True, sep="\t"),
    'parquet': lambda rel, path: rel.write_parquet(path),
    'json': lambda rel, path: rel.pl().write_json(path, row_oriented=True),
    'xlsx': lambda rel, path: rel.pl().write_excel(path),
    'avro': lambda rel, path: pdx.to_avro(path, rel.to_df()),
    'orc': lambda rel, path: write_orc(path, rel.to_df()),
    'feather': lambda rel, path: rel.to_df().to_feather(path, version=1),
    'xml': lambda rel, path: rel.to_df().to_xml(path, index=False),
    'dta': lambda rel, path: rel.to_df().to_stata(path, write_index=False),
    'h5': lambda rel, path: rel.to_df().to_hdf(path, key='s', index=False),
    'hdf5': lambda rel, path: rel.to_df().to_hdf(path, key='s', index=False),
}

assert set(read_formats) == set(READERS.keys()), \
    "read_formats does not match keys in READERS dict"

assert set(write_formats) == set(WRITERS.keys()), \
    "write_formats does not match keys in WRITERS dict"


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

    def get_schema(self):
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
            cols_to_display = table[1]
            schema[table[0]] = cols_to_display

        return {'schema': schema, 'error': None}

    def read_file(self, path: str) -> duckdb.DuckDBPyRelation:
        """Reads a file based on its extension."""

        self.validate_file_path(path, read_formats)
        file_extension = self.get_file_ext(path)

        if os.path.isdir(path):
            path = os.path.join(path, f'*.{file_extension}')

        rel: duckdb.DuckDBPyRelation = READERS[file_extension](path, self.converter)

        cols_count = len(rel.columns)

        if cols_count > 100:
            raise Exception(
                f"At the moment, duckdb can't process tables more than 100 columns wide. Use polars engine to import this file")

        return rel

    def write_file(self, file_path: str, latest_query_result: duckdb.DuckDBPyRelation) -> dict:
        """Writes the result of the latest query to a file based on its extension."""
       
        self.validate_file_path(file_path, write_formats)
        file_extension = self.get_file_ext(file_path)

        WRITERS[file_extension](latest_query_result, file_path)

        return {'error': None}

    def to_dataframe(self, max_rows: int, max_cols: int, lf: duckdb.DuckDBPyRelation) -> pl.DataFrame:
        cols_to_display = lf.columns[0: max_cols]
        return lf.limit(max_rows).pl().select(cols_to_display)
