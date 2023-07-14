from engine import DataEngine
import polars as pl
import pandas as pd
import os
from typing import Callable, Dict

SUPPORTED_EXTENSIONS = ['.csv', '.parquet', '.xml', ".sav", ".avro", ".dta", ".xpt",
                        '.json', '.tsv', '.xlsx', '.feather', ".sas7bdat"]

WriterType = Callable[[pl.DataFrame, str], None]
ReaderType = Callable[[str], pl.LazyFrame]

WRITERS: Dict[str, WriterType] = {
    '.csv': lambda result, path: result.write_csv(path),
    '.tsv': lambda result, path: result.write_csv(path, sep="\t"),
    '.parquet': lambda result, path: result.write_parquet(path),
    '.json': lambda result, path: result.write_json(path, row_oriented=True),
    '.xlsx': lambda result, path: result.write_excel(path),
    '.avro': lambda result, path: result.write_avro(path),
    '.feather': lambda result, path: result.to_pandas().to_feather(path, version=1),
    '.xml': lambda result, path: result.to_pandas().to_xml(path, index=False),
    '.dta': lambda result, path: result.to_pandas().to_stata(path, write_index=False),
}

READERS: Dict[str, ReaderType] = {
    '.csv': lambda path: pl.scan_csv(path, ignore_errors=True),
    '.tsv': lambda path: pl.scan_csv(path, ignore_errors=True, separator="\t"),
    '.parquet': lambda path: pl.scan_parquet(path),
    '.json': lambda path: pl.read_json(path),
    '.xlsx': lambda path: pl.read_excel(path),
    '.feather': lambda path: pl.from_pandas(pd.read_feather(path)),
    '.sas7bdat': lambda path: pl.from_pandas(pd.read_sas(path, encoding='utf-8')),
    '.xpt': lambda path: pl.from_pandas(pd.read_sas(path, encoding='utf-8')),
    '.xml': lambda path: pl.from_pandas(pd.read_xml(path)),
    '.sav': lambda path: pl.from_pandas(pd.read_spss(path)),
    '.dta': lambda path: pl.from_pandas(pd.read_stata(path)),
}


class PolarsEngine(DataEngine):
    """Polars data engine."""

    def __init__(self):
        self.ctx = pl.SQLContext(eager_execution=False)
        self.AVOID_LIVE_EVALUATION = ['CREATE', 'DROP', 'DELETE']
        self.UNSUPPORTED_STATEMENTS = ['INSERT']

    def register(self, name: str, df: pl.DataFrame):
        self.ctx.register_many({name: df})

    def sql(self, query: str):
        return self.ctx.execute(query, eager=False)

    def is_empty(self, lazyframe: pl.LazyFrame) -> bool:
        return False if len(lazyframe.columns) > 0 else True

    def get_schema(self, max_cols: int):
        """Returns the schema of all tables in the SQL context."""
        schema = {}
        tables = self.ctx.tables()

        for table in tables:
            get_columns_sql = f'SELECT * FROM "{table}" LIMIT 0;'
            columns = self.sql(get_columns_sql).collect().columns[0: max_cols]
            schema[table] = columns

        return {'schema': schema, 'error': None}

    def read_file(self, file_path: str) -> pl.LazyFrame:
        """Reads a file based on its extension."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file '{file_path}' does not exist.")

        file_extension = os.path.splitext(file_path)[1]

        if file_extension not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

        return READERS[file_extension](file_path)

    def write_file(self, file_path: str, latest_query_result: pl.LazyFrame) -> dict:
        """Writes the result of the latest query to a file based on its extension."""
        df = latest_query_result.collect(streaming=True)
        file_extension = os.path.splitext(file_path)[1]

        if file_extension not in SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

        WRITERS[file_extension](df, file_path)
        del df

        return {'error': None}

    def to_dataframe(self, max_rows: int, max_cols: int, lf: pl.LazyFrame) -> pl.DataFrame:
        return lf.select(lf.columns[0: max_cols]).limit(max_rows).collect()
