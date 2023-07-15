import sqlglot
import sqlparse
from server.engine import DataEngine
from typing import Dict, Optional


class SqlValidator:
    """
    SQL Validator class to check and validate SQL statements.
    """

    def __init__(self, engine: DataEngine):
        self.engine = engine

    def validate(self, data: Dict) -> Dict:

        sql = data.get('data', '')
        formatted_sql = sqlparse.format(sql, strip_comments=True)
        statements = sqlparse.split(formatted_sql)

        if not statements:
            return self._format_validation_response(False, formatted_sql, None, "No SQL statement found")

        last_statement = statements[-1]

        unsupported_statements = self._validate_statement_type(last_statement)
        if unsupported_statements:
            return self._format_validation_response(False, formatted_sql, last_statement, unsupported_statements)

        unsupported_expressions = self._validate_expressions(last_statement)
        if unsupported_expressions:
            return self._format_validation_response(False, formatted_sql, last_statement, unsupported_expressions)

        return self._attempt_sql_execution(formatted_sql, last_statement)

    def _find_statement_types(self, statement: str, stmt_type_list: list) -> list:
        parsed = sqlparse.parse(statement)
        return [stmt.get_type() for stmt in parsed if stmt.get_type() in stmt_type_list]

    def _find_expressions(self, statement, expressions):
        found_expressions = []
        parsed = sqlparse.parse(statement)
        for stmt in parsed:
            for token in stmt.tokens:
                if token.ttype is None and token.is_group:
                    for item in token.tokens:
                        if item.ttype is None:
                            for sub_item in item.flatten():
                                if sub_item.value.upper() in [expr.upper() for expr in expressions]:
                                    found_expressions.append(sub_item.value)
        return found_expressions

    def _is_write_statement(self, statement: str) -> bool:
        return self._find_statement_types(statement, self.engine.AVOID_LIVE_EVALUATION)

    def _validate_statement_type(self, statement: str) -> Optional[str]:
        unsupported_statements = self._find_statement_types(
            statement, self.engine.UNSUPPORTED_STATEMENTS)

        if unsupported_statements:
            return f'Statements of {unsupported_statements} type are not supported by polars. Try switching to duckdb engine'
        return None

    def _validate_expressions(self, statement: str) -> Optional[str]:
        unsupported_expressions = self._find_expressions(
            statement, self.engine.UNSUPPORTED_EXPRESSIONS)

        if unsupported_expressions:
            return f'Expressions of {unsupported_expressions} type are not supported by polars. Try switching to duckdb engine'
        return None

    def _attempt_sql_execution(self, formatted_sql: str, last_statement: str) -> Dict:
        try:
            if self._is_write_statement(last_statement):
                sqlglot.transpile(last_statement)
            else:
                self.engine.sql(last_statement)
        except Exception as e:
            error = self._clean_error(e)
            return self._format_validation_response(False, formatted_sql, last_statement, error)

        return self._format_validation_response(True, formatted_sql, last_statement, None)

    @staticmethod
    def _clean_error(error: Exception) -> str:
        error_str = str(error)

        substrings_to_replace = [
            '\033[0m', '\033[4m', 'sql parser error:', 'Parser Error:']

        for substr in substrings_to_replace:
            error_str = error_str.replace(substr, '')

        return error_str.strip().capitalize()

    @staticmethod
    def _format_validation_response(result: bool, formatted_sql: str, last_statement: str, error: str) -> Dict:
        return {"result": result, 'sql': formatted_sql, 'last_statement': last_statement, 'error': error}
