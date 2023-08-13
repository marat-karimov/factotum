from server.engine import DataEngine
import polars as pl
from typing import Callable, Dict
from server.converter import ReadConverter
from server.read_config import read_formats, write_formats
import pandavro as pdx

WriterType = Callable[[pl.DataFrame, str], None]
ReaderType = Callable[[str, ReadConverter], pl.LazyFrame]

READERS: Dict[str, ReaderType] = {
    'csv': lambda path, conv: pl.scan_csv(path, ignore_errors=True),
    'tsv': lambda path, conv: pl.scan_csv(path, ignore_errors=True, separator="\t"),
    'parquet': lambda path, conv: pl.scan_parquet(path),
    'json': lambda path, conv: pl.read_json(path),
    'avro': lambda path, conv: pl.scan_parquet(conv.avro_to_parquet(path)),
    'orc': lambda path, conv: pl.scan_parquet(conv.orc_to_parquet(path)),
    'xlsx': lambda path, conv: pl.scan_parquet(conv.excel_to_parquet(path)),
    'xls': lambda path, conv: pl.scan_parquet(conv.excel_to_parquet(path)),
    'xlsm': lambda path, conv: pl.scan_parquet(conv.excel_to_parquet(path)),
    'xlsb': lambda path, conv: pl.scan_parquet(conv.excel_to_parquet(path)),
    'odf': lambda path, conv: pl.scan_parquet(conv.excel_to_parquet(path)),
    'ods': lambda path, conv: pl.scan_parquet(conv.excel_to_parquet(path)),
    'odt': lambda path, conv: pl.scan_parquet(conv.excel_to_parquet(path)),
    'feather': lambda path, conv: pl.scan_parquet(conv.feather_to_parquet(path)),
    'sas7bdat': lambda path, conv: pl.scan_parquet(conv.sas_to_parquet(path, encoding='utf-8')),
    'xpt': lambda path, conv: pl.scan_parquet(conv.sas_to_parquet(path, encoding='utf-8')),
    'xml': lambda path, conv: pl.scan_parquet(conv.xml_to_parquet(path)),
    'sav': lambda path, conv: pl.scan_parquet(conv.spss_to_parquet(path)),
    'dta': lambda path, conv: pl.scan_parquet(conv.stata_to_parquet(path))
}

WRITERS: Dict[str, WriterType] = {
    'csv': lambda result, path: result.write_csv(path),
    'tsv': lambda result, path: result.write_csv(path, separator="\t"),
    'parquet': lambda result, path: result.write_parquet(path),
    'json': lambda result, path: result.write_json(path, row_oriented=True),
    'xlsx': lambda result, path: result.write_excel(path),
    'avro': lambda result, path: pdx.to_avro(path, result.to_pandas()),
    'orc': lambda result, path: result.to_pandas().to_orc(path, index=False),
    'feather': lambda result, path: result.to_pandas().to_feather(path, version=1),
    'xml': lambda result, path: result.to_pandas().to_xml(path, index=False),
    'dta': lambda result, path: result.to_pandas().to_stata(path, write_index=False),
}

assert set(read_formats) == set(READERS.keys()), \
    "read_formats does not match keys in READERS dict"

assert set(write_formats) == set(WRITERS.keys()), \
    "write_formats does not match keys in WRITERS dict"


class PolarsEngine(DataEngine):
    """Polars data engine."""

    def __init__(self, converter: ReadConverter):
        self.converter = converter
        self.ctx = pl.SQLContext(eager_execution=False)
        self.AVOID_LIVE_EVALUATION = ['CREATE', 'DROP', 'DELETE']
        self.UNSUPPORTED_STATEMENTS = ['INSERT']
        self.UNSUPPORTED_EXPRESSIONS = ['LIKE']

    def register(self, name: str, df: pl.DataFrame):
        self.ctx.register_many({name: df})

    def sql(self, query: str):
        return self.ctx.execute(query, eager=False)

    def is_empty(self, lazyframe: pl.LazyFrame) -> bool:
        return False if len(lazyframe.columns) > 0 else True

    def get_schema(self):
        """Returns the schema of all tables in the SQL context."""
        schema = {}
        tables = self.ctx.tables()

        for table in tables:
            get_columns_sql = f'SELECT * FROM "{table}" LIMIT 0;'
            columns = self.sql(get_columns_sql).collect().columns
            schema[table] = columns

        return {'schema': schema, 'error': None}

    def read_file(self, file_path: str) -> pl.LazyFrame:
        """Reads a file based on its extension."""

        self.validate_file_path(file_path, read_formats)
        file_extension = self.get_file_ext(file_path)

        return READERS[file_extension](file_path, self.converter)

    def write_file(self, file_path: str, latest_query_result: pl.LazyFrame) -> dict:
        """Writes the result of the latest query to a file based on its extension."""

        df = latest_query_result.collect(streaming=True)

        self.validate_file_path(file_path, write_formats)
        file_extension = self.get_file_ext(file_path)

        WRITERS[file_extension](df, file_path)
        del df

        return {'error': None}

    def to_dataframe(self, max_rows: int, max_cols: int, lf: pl.LazyFrame) -> pl.DataFrame:
        return lf.select(lf.columns[0: max_cols]).limit(max_rows).collect()
