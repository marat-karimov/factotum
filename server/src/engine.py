from typing import List
import polars as pl
from abc import ABC, abstractmethod
import duckdb
import os


class DataEngine(ABC):
    AVOID_LIVE_EVALUATION = []
    UNSUPPORTED_STATEMENTS = []
    UNSUPPORTED_EXPRESSIONS = []

    @abstractmethod
    def register(self, name: str, df: duckdb.DuckDBPyRelation | pl.LazyFrame):
        pass

    @abstractmethod
    def sql(self, query: str) -> duckdb.DuckDBPyRelation | pl.LazyFrame:
        pass

    @abstractmethod
    def to_dataframe(self, max_rows: int, max_cols: int, lf: duckdb.DuckDBPyRelation | pl.LazyFrame) -> pl.DataFrame:
        pass

    @abstractmethod
    def is_empty(self, lazyframe: duckdb.DuckDBPyRelation | pl.LazyFrame) -> bool:
        pass

    @abstractmethod
    def read_file(self, file_path: str):
        pass

    @abstractmethod
    def write_file(self, file_path: str, latest_query_result: duckdb.DuckDBPyRelation | pl.LazyFrame):
        pass

    @abstractmethod
    def get_schema(self):
        pass

    @staticmethod
    def get_file_ext(path: str):
        if os.path.isdir(path):
            extensions = set(
                os.path.splitext(file)[1].replace('.', '') 
                for file in os.listdir(path) 
                if os.path.isfile(os.path.join(path, file))
            )

            extensions.discard('')
            
            if len(extensions) > 1:
                raise ValueError(f"Files in the imported directory have different extensions: {extensions}")
            return next(iter(extensions), None)
        else:
            return os.path.splitext(path)[1].replace('.', '')

    def validate_file_path(self, file_path: str, supported_formats: List[str]):
        file_extension = self.get_file_ext(file_path)

        if file_extension not in supported_formats:
            raise ValueError(
                f"Unsupported file format. Only {', '.join(supported_formats)} are supported.")
