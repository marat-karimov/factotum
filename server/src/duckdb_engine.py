
import os
import duckdb
import polars as pl
import pandavro as pdx
from server.src.engine import DataEngine
from duckdb import DuckDBPyRelation, DuckDBPyConnection
from typing import Callable, Dict
from server.src.converter import ReadConverter
from server.src.read_config import read_formats, write_formats, filename_column
from server.src.pyorc_wrapper import write_orc
from server.src.pyreadstat_wrapper import write_por, write_xpt, write_sav, write_zsav

WriterType = Callable[[DuckDBPyRelation, str], None]
ReaderType = Callable[[str, DuckDBPyConnection, ReadConverter], DuckDBPyRelation]

READERS: Dict[str, ReaderType] = {
    'csv': lambda path, conn, conv: conn.read_csv(path, header=True, filename=filename_column),
    'tsv': lambda path, conn, conv: conn.read_csv(path, header=True, sep="\t", filename=filename_column),
    'parquet': lambda path, conn, conv: conn.read_parquet(path),
    'json': lambda path, conn, conv: conn.read_json(path, filename=filename_column),
    'avro': lambda path, conn, conv: conn.read_csv(conv.avro_to_csv(path)),
    'orc': lambda path, conn, conv: conn.read_csv(conv.orc_to_csv(path)),
    'xlsx': lambda path, conn, conv: conn.read_csv(conv.excel_to_csv(path)),
    'xls': lambda path, conn, conv: conn.read_csv(conv.excel_to_csv(path)),
    'xlsm': lambda path, conn, conv: conn.read_csv(conv.excel_to_csv(path)),
    'xlsb': lambda path, conn, conv: conn.read_csv(conv.excel_to_csv(path)),
    'odf': lambda path, conn, conv: conn.read_csv(conv.excel_to_csv(path)),
    'ods': lambda path, conn, conv: conn.read_csv(conv.excel_to_csv(path)),
    'odt': lambda path, conn, conv: conn.read_csv(conv.excel_to_csv(path)),
    'feather': lambda path, conn, conv: conn.read_csv(conv.feather_to_csv(path)),
    'sas7bdat': lambda path, conn, conv: conn.read_csv(conv.sas_to_csv(path, encoding='utf-8')),
    'xpt': lambda path, conn, conv: conn.read_csv(conv.xpt_to_csv(path)),
    'xml': lambda path, conn, conv: conn.read_csv(conv.xml_to_csv(path)),
    'sav': lambda path, conn, conv: conn.read_csv(conv.spss_to_csv(path)),
    'zsav': lambda path, conn, conv: conn.read_csv(conv.spss_to_csv(path)),
    'dta': lambda path, conn, conv: conn.read_csv(conv.stata_to_csv(path, convert_categoricals=False)),
    'h5': lambda path, conn, conv: conn.read_csv(conv.hdf_to_csv(path)),
    'hdf5': lambda path, conn, conv: conn.read_csv(conv.hdf_to_csv(path)),
    'por': lambda path, conn, conv: conn.read_csv(conv.por_to_csv(path)),
    'sdf': lambda path, conn, conv: conn.read_csv(conv.sdf_to_csv(path))
}

WRITERS: Dict[str, WriterType] = {
    'csv': lambda rel, path: rel.write_csv(path, header=True),
    'tsv': lambda rel, path: rel.write_csv(path, header=True, sep="\t"),
    'parquet': lambda rel, path: rel.write_parquet(path),
    'json': lambda rel, path: rel.pl().write_json(path),
    'xlsx': lambda rel, path: rel.to_df().to_excel(path, index=False),
    'avro': lambda rel, path: pdx.to_avro(path, rel.to_df()),
    'orc': lambda rel, path: write_orc(path, rel.to_df()),
    'feather': lambda rel, path: rel.to_df().to_feather(path, version=1),
    'xml': lambda rel, path: rel.to_df().to_xml(path, index=False),
    'dta': lambda rel, path: rel.to_df().to_stata(path, write_index=False),
    'h5': lambda rel, path: rel.to_df().to_hdf(path, key='s', index=False),
    'hdf5': lambda rel, path: rel.to_df().to_hdf(path, key='s', index=False),
    'por': lambda rel, path: write_por(path, rel.to_df()),
    'xpt': lambda rel, path: write_xpt(path, rel.to_df()),
    'sav': lambda rel, path: write_sav(path, rel.to_df()),
    'zsav': lambda rel, path: write_zsav(path, rel.to_df()),
    'ods': lambda rel, path: rel.to_df().to_excel(path, index=False, engine="odf"),
    'html': lambda rel, path: rel.to_df().to_html(path, index=False),
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

    def register(self, name: str, df: DuckDBPyRelation):
        self.ctx.register(name, df)

    def sql(self, query: str):
        return self.ctx.sql(query)

    def is_empty(self, lazyframe: DuckDBPyRelation) -> bool:
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

    def read_file(self, path: str) -> DuckDBPyRelation:
        """Reads a file based on its extension."""

        self.validate_file_path(path, read_formats)
        file_extension = self.get_file_ext(path)

        if os.path.isdir(path):
            path = os.path.join(path, f'*.{file_extension}')

        rel: DuckDBPyRelation = READERS[file_extension](path, self.ctx, self.converter)

        return rel

    def write_file(self, file_path: str, latest_query_result: DuckDBPyRelation) -> dict:
        """Writes the result of the latest query to a file based on its extension."""
       
        self.validate_file_path(file_path, write_formats)
        file_extension = self.get_file_ext(file_path)

        columns = latest_query_result.columns
        latest_query_result = latest_query_result.project(*[x for x in columns if x != filename_column])

        WRITERS[file_extension](latest_query_result, file_path)

        return {'error': None}

    def to_dataframe(self, max_rows: int, max_cols: int, lf: DuckDBPyRelation) -> pl.DataFrame:
        cols_to_display = lf.columns[0: max_cols]
        return lf.limit(max_rows).pl().select(cols_to_display)
