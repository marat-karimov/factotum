import pyreadstat
import pandas as pd 

def read_por(path):
    df: pd.DataFrame = pyreadstat.read_por(path)[0]
    return df

def write_por(path: str, df: pd.DataFrame):
    df.columns = [x[:8] for x in df.columns] # The format has a limitation of 8 chars for column
    pyreadstat.write_por(df, path)

def read_xpt(path):
    df: pd.DataFrame = pyreadstat.read_xport(path)[0]
    return df

def write_xpt(path: str, df: pd.DataFrame):
    pyreadstat.write_xport(df, path)

def write_sav(path: str, df: pd.DataFrame):
    pyreadstat.write_sav(df, path)

def write_zsav(path: str, df: pd.DataFrame):
    pyreadstat.write_sav(df, path, compress=True)
