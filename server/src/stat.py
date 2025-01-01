import pyreadstat
import pandas as pd 

pyreadstat.wr
def read_por(path):
    df: pd.DataFrame = pyreadstat.read_por(path)[0]
    return df

def write_por(path: str, df: pd.DataFrame):
    df.columns = [x[:8] for x in df.columns] # The format has a limitation of 8 chars for column
    pyreadstat.write_por(df, path)
