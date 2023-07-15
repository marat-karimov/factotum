from typing import Dict, Callable, Any
from functools import wraps
import polars as pl
from abc import ABC, abstractmethod
import duckdb


class DataEngine(ABC):
    """Interface for data engine."""

    AVOID_LIVE_EVALUATION = []
    UNSUPPORTED_STATEMENTS = []
    UNSUPPORTED_EXPRESSIONS = []

    @abstractmethod
    def register(self, name: str, df: Any):
        pass

    @abstractmethod
    def sql(self, query: str) -> duckdb.DuckDBPyRelation | pl.LazyFrame:
        pass

    @abstractmethod
    def to_dataframe(self, max_rows: int, max_cols: int, lf: duckdb.DuckDBPyRelation | pl.LazyFrame) -> pl.DataFrame:
        pass

    abstractmethod

    def is_empty(self, lazyframe: duckdb.DuckDBPyRelation | pl.LazyFrame) -> bool:
        pass

    @abstractmethod
    def read_file(self, file_path: str):
        pass

    @abstractmethod
    def write_file(self, file_path: str, latest_query_result: duckdb.DuckDBPyRelation | pl.LazyFrame):
        pass

    @abstractmethod
    def get_schema(self, max_cols: int):
        pass
