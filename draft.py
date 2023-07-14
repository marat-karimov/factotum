import duckdb
import pandas as pd

path = r"C:\Users\ozzy\Desktop\factotum test files\debug"

files = ['dta_auto.dta', 'dta_auto_ni.dta', 'dta_auto.dta', 'dta_auto_ni.dta', 'dta_auto.dta', 'dta_auto_ni.dta']

for file in files:
    df = duckdb.from_df(pd.read_stata(path + "\\" + file))

    conn = duckdb.connect(':memory:')
    duckdb.register(file, df)

    duckdb.sql(f"SET memory_limit='1MB'")
    res = duckdb.sql(f'select * from "{file}" limit 100')

    print(res)