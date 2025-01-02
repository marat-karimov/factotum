import pyorc
import pandas as pd


def dtype_to_orc_type(dtype):
    dtype_str = str(dtype)
    type_mapping = {
        'int': 'int',
        'int64': 'bigint',
        'float': 'double',
        'bool': 'boolean',
        'datetime': 'timestamp',
        'timedelta': 'interval',
        'category': 'string'
    }

    for key, val in type_mapping.items():
        if key in dtype_str:
            return val
    return 'string'


def generate_orc_schema(df: pd.DataFrame) -> str:
    column_types = [(col, dtype_to_orc_type(dtype))
                    for col, dtype in zip(df.columns, df.dtypes)]
    return f"struct<{','.join([':'.join(item) for item in column_types])}>"


def write_orc(path: str, df: pd.DataFrame):
    schema = generate_orc_schema(df)

    output = open(path, 'wb')
    writer = pyorc.Writer(output, schema, struct_repr=pyorc.StructRepr.DICT)
    writer.writerows(df.to_dict(orient="records"))
    writer.close()


def read_orc(path, **kwargs):
    with open(path, "rb") as orc_file:
        reader = pyorc.Reader(orc_file, **kwargs)
        orc_data = reader.read()
        orc_schema = reader.schema

    columns = list(orc_schema.fields)
    df = pd.DataFrame(data=orc_data, columns=columns)
    return df
