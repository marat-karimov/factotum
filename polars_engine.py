from engine import DataEngine
import polars as pl
import os

SUPPORTED_EXTENSIONS = ['.csv', '.parquet', '.json', '.tsv', '.xlsx']


class PolarsEngine(DataEngine):
    """Polars data engine."""

    def __init__(self):
        self.ctx = pl.SQLContext(eager_execution=False)
        self.AVOID_LIVE_EVALUATION = ['CREATE', 'DROP', 'DELETE']
        self.UNSUPPORTED_STATEMENTS = ['INSERT']

    def connect(self) -> pl.SQLContext:
        return self.ctx

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

    def read_file(self, file_path: str):
        """Reads a file based on its extension."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file '{file_path}' does not exist.")

        file_extension = os.path.splitext(file_path)[1]

        if file_extension == '.csv':
            return pl.scan_csv(file_path, ignore_errors=True)
        
        if file_extension == '.tsv':
            return pl.scan_csv(file_path, ignore_errors=True, separator="\t")

        if file_extension == '.parquet':
            return pl.scan_parquet(file_path)

        if file_extension == '.json':
            return pl.read_json(file_path)

        if file_extension == '.xlsx':
            return pl.read_excel(file_path)

        raise ValueError(
            f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

    def write_file(self, file_path: str, latest_query_result: pl.LazyFrame):
        df = latest_query_result.collect(streaming=True)

        file_extension = os.path.splitext(file_path)[1]

        if file_extension == '.csv':
            df.write_csv(file_path)
            del df
            return {'error': None}
        
        if file_extension == '.tsv':
            df.write_csv(file_path, separator="\t")
            del df
            return {'error': None}

        if file_extension == '.parquet':
            df.write_parquet(file_path)
            del df
            return {'error': None}

        if file_extension == '.xlsx':
            df.write_excel(file_path)
            del df
            return {'error': None}

        if file_extension == '.json':
            df.write_json(file_path, row_oriented=True)
            del df
            return {'error': None}

        raise ValueError(
            f"Unsupported file format. Only {', '.join(SUPPORTED_EXTENSIONS)} are supported.")

        

    def to_dataframe(self, max_rows: int, lazyframe: pl.LazyFrame) -> pl.DataFrame:
        return lazyframe.limit(max_rows).collect()
