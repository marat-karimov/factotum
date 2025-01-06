import pyreadstat
import pandas as pd


def strip_non_alpha(s: str):
    for i, char in enumerate(s):
        if char.isalpha():
            return s[i:]
    return s


def deduplicate_with_suffix(strings):
    max_length = 8
    occurrences = {}
    deduplicated = []

    for string in strings:
        suffix = ""
        base_string = string

        while True:
            if suffix:
                base_length = max_length - len(suffix)
                truncated_string = base_string[:base_length]
                candidate = truncated_string + suffix
            else:
                candidate = base_string[:max_length]

            if candidate not in occurrences:
                occurrences[candidate] = 1
                deduplicated.append(candidate)
                break
            else:
                occurrences[candidate] += 1
                suffix = f"_{occurrences[candidate] - 1}"

    return deduplicated


def read_por(path):
    df: pd.DataFrame = pyreadstat.read_por(path)[0]
    return df


def write_por(path: str, df: pd.DataFrame):
    df.columns = [strip_non_alpha(x) for x in df.columns]
    df.columns = deduplicate_with_suffix(df.columns)
    pyreadstat.write_por(df, path)


def read_xpt(path):
    df: pd.DataFrame = pyreadstat.read_xport(path)[0]
    return df


def write_xpt(path: str, df: pd.DataFrame):
    pyreadstat.write_xport(df, path)


def write_sav(path: str, df: pd.DataFrame):
    df.columns = [strip_non_alpha(x) for x in df.columns]
    pyreadstat.write_sav(df, path)


def write_zsav(path: str, df: pd.DataFrame):
    df.columns = [strip_non_alpha(x) for x in df.columns]
    pyreadstat.write_sav(df, path, compress=True)
