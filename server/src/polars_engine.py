from server.src.engine import DataEngine
import polars as pl
import os
from typing import Callable, Dict
from server.src.converter import ReadConverter
from server.src.read_config import read_formats, write_formats, filename_column
import pandavro as pdx
from server.src.orc import write_orc
from server.src.pyreadstat_wrapper import write_por, write_xpt, write_zsav, write_sav

WriterType = Callable[[pl.DataFrame, str], None]
ReaderType = Callable[[str, ReadConverter], pl.LazyFrame]

READERS: Dict[str, ReaderType] = {
    'csv': lambda path, conv: pl.scan_csv(path, ignore_errors=True, include_file_paths=filename_column,
                                          try_parse_dates=True),
    'tsv': lambda path, conv: pl.scan_csv(path, ignore_errors=True, separator="\t", include_file_paths=filename_column,
                                          try_parse_dates=True),
    'parquet': lambda path, conv: pl.scan_parquet(path, include_file_paths=filename_column),
    'json': lambda path, conv: pl.read_json(path),
    'avro': lambda path, conv: pl.scan_csv(conv.avro_to_csv(path)),
    'orc': lambda path, conv: pl.scan_csv(conv.orc_to_csv(path)),
    'xlsx': lambda path, conv: pl.scan_csv(conv.excel_to_csv(path)),
    'xls': lambda path, conv: pl.scan_csv(conv.excel_to_csv(path)),
    'xlsm': lambda path, conv: pl.scan_csv(conv.excel_to_csv(path)),
    'xlsb': lambda path, conv: pl.scan_csv(conv.excel_to_csv(path)),
    'odf': lambda path, conv: pl.scan_csv(conv.excel_to_csv(path)),
    'ods': lambda path, conv: pl.scan_csv(conv.excel_to_csv(path)),
    'odt': lambda path, conv: pl.scan_csv(conv.excel_to_csv(path)),
    'feather': lambda path, conv: pl.scan_csv(conv.feather_to_csv(path)),
    'sas7bdat': lambda path, conv: pl.scan_csv(conv.sas_to_csv(path, encoding='utf-8')),
    'xpt': lambda path, conv: pl.scan_csv(conv.xpt_to_csv(path)),
    'xml': lambda path, conv: pl.scan_csv(conv.xml_to_csv(path)),
    'sav': lambda path, conv: pl.scan_csv(conv.spss_to_csv(path)),
    'zsav': lambda path, conv: pl.scan_csv(conv.spss_to_csv(path)),
    'dta': lambda path, conv: pl.scan_csv(conv.stata_to_csv(path, convert_categoricals=False)),
    'h5': lambda path, conv: pl.scan_csv(conv.hdf_to_csv(path)),
    'hdf5': lambda path, conv: pl.scan_csv(conv.hdf_to_csv(path)),
    'por': lambda path, conv: pl.scan_csv(conv.por_to_csv(path))
}

WRITERS: Dict[str, WriterType] = {
    'csv': lambda result, path: result.write_csv(path),
    'tsv': lambda result, path: result.write_csv(path, separator="\t"),
    'parquet': lambda result, path: result.write_parquet(path),
    'json': lambda result, path: result.write_json(path),
    'xlsx': lambda result, path: result.write_excel(path),
    'avro': lambda result, path: pdx.to_avro(path, result.to_pandas()),
    'orc': lambda result, path: write_orc(path, result.to_pandas()),
    'feather': lambda result, path: result.to_pandas().to_feather(path, version=1),
    'xml': lambda result, path: result.to_pandas().to_xml(path, index=False),
    'dta': lambda result, path: result.to_pandas().to_stata(path, write_index=False),
    'h5': lambda result, path: result.to_pandas().to_hdf(path, key='s', index=False),
    'hdf5': lambda result, path: result.to_pandas().to_hdf(path, key='s', index=False),
    'por': lambda result, path: write_por(path, result.to_pandas()),
    'xpt': lambda result, path: write_xpt(path, result.to_pandas()),
    'sav': lambda result, path: write_sav(path, result.to_pandas()),
    'zsav': lambda result, path: write_zsav(path, result.to_pandas()),
    'ods': lambda result, path: result.to_pandas().to_excel(path, index=False, engine="odf"),
    'html': lambda result, path: result.to_pandas().to_html(path, index=False),
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
        return False if len(lazyframe.collect_schema().names()) > 0 else True

    def get_schema(self):
        """Returns the schema of all tables in the SQL context."""
        schema = {}
        tables = self.ctx.tables()

        for table in tables:
            get_columns_sql = f'SELECT * FROM "{table}" LIMIT 0;'
            columns = self.sql(get_columns_sql).collect().columns
            schema[table] = columns

        return {'schema': schema, 'error': None}

    def read_file(self, path: str) -> pl.LazyFrame:
        """Reads a file based on its extension."""

        self.validate_file_path(path, read_formats)
        file_extension = self.get_file_ext(path)

        if os.path.isdir(path):
            path = os.path.join(path, f'*.{file_extension}')

        return READERS[file_extension](path, self.converter)

    def write_file(self, file_path: str, latest_query_result: pl.LazyFrame) -> dict:
        """Writes the result of the latest query to a file based on its extension."""
        latest_query_result = latest_query_result.drop(filename_column, strict=False)

        df = latest_query_result.collect(streaming=True)

        self.validate_file_path(file_path, write_formats)
        file_extension = self.get_file_ext(file_path)

        WRITERS[file_extension](df, file_path)
        del df

        return {'error': None}

    def to_dataframe(self, max_rows: int, max_cols: int, lf: pl.LazyFrame) -> pl.DataFrame:
        return lf.select(lf.collect_schema().names()[0: max_cols]).limit(max_rows).collect()
