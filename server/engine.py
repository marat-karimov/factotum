from typing import List, Any
from functools import wraps
import polars as pl
from abc import ABC, abstractmethod
import duckdb
import os


class DataEngine(ABC):
    """Interface for data engine."""

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
    def get_file_ext(file_path: str):
        return os.path.splitext(file_path)[1].replace('.', '')

    def validate_file_path(self, file_path: str, supported_formats: List[str]):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file '{file_path}' does not exist.")

        file_extension = self.get_file_ext(file_path)

        if file_extension not in supported_formats:
            raise ValueError(
                f"Unsupported file format. Only {', '.join(supported_formats)} are supported.")
