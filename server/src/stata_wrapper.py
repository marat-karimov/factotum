import pandas as pd


def write_dta(path, df: pd.DataFrame):
    columns_with_tz = [col for col in df.columns if pd.api.types.is_datetime64tz_dtype(df[col])]
    for col in columns_with_tz:
        df[col] = df[col].dt.tz_localize(None)  # dtypes with tz info are not supported

    df.to_stata(path, write_index=False)
