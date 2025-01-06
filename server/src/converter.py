import os
import pandas as pd
import dask.dataframe as dd
import tempfile
import shutil
import hashlib
import pandavro as pdx
from server.src.pyorc_wrapper import read_orc
from server.src.pyreadstat_wrapper import read_por, read_xpt
from server.src.rdkit_wrapper import read_sdf
from server.src.read_config import filename_column
from glob import glob


class ReadConverter:
    CHUNKSIZE = 500000

    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()

    def stata_to_csv(self, path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file_chunks(pd.read_stata, path, chunksize, **kwargs)

    def sas_to_csv(self, path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file_chunks(pd.read_sas, path, chunksize, **kwargs)

    def sdf_to_csv(self, path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file_chunks(read_sdf, path, chunksize, **kwargs)

    def xml_to_csv(self, path, **kwargs):
        return self._read_file_once(pd.read_xml, path, **kwargs)

    def spss_to_csv(self, path, **kwargs):
        return self._read_file_once(pd.read_spss, path, **kwargs)

    def feather_to_csv(self, path, **kwargs):
        return self._read_file_once(pd.read_feather, path, **kwargs)

    def excel_to_csv(self, path, **kwargs):
        return self._read_file_once(pd.read_excel, path, **kwargs)

    def orc_to_csv(self, path, **kwargs):
        return self._read_file_once(read_orc, path, **kwargs)

    def hdf_to_csv(self, path, **kwargs):
        return self._read_file_once(pd.read_hdf, path, **kwargs)

    def avro_to_csv(self, path, **kwargs):
        return self._read_file_once(pdx.read_avro, path, **kwargs)

    def por_to_csv(self, path, **kwargs):
        return self._read_file_once(read_por, path, **kwargs)

    def xpt_to_csv(self, path, **kwargs):
        return self._read_file_once(read_xpt, path, **kwargs)

    def pkl_to_csv(self, path, **kwargs):
        return self._read_file_once(pd.read_pickle, path, **kwargs)

    def _read_file_chunks(self, read_func, path, chunksize, **kwargs):
        temp_file_path = self._generate_temp_file_path(path)
        
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

        chunk_counter = 0

        for file_path in glob(path):
            for chunk in read_func(file_path, chunksize=chunksize, **kwargs):
                chunk[filename_column] = file_path
                chunk.columns = chunk.columns.map(str)
                dask_df = dd.from_pandas(chunk, npartitions=1)
                dask_df.to_parquet(temp_file_path, name_function=lambda index: f"data-{chunk_counter}-{index}.parquet", write_index=False)
                chunk_counter += 1
                del chunk
                del dask_df

        return temp_file_path + "/*.parquet"

    def _read_file_once(self, read_func, path, **kwargs):
        temp_file_path = self._generate_temp_file_path(path)

        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

        cols_number_expected = None
        file_counter = 0

        for file_path in glob(path):
            df: pd.DataFrame = read_func(file_path, **kwargs)
            cols_number_actual = len(df.columns)

            if cols_number_expected is None:
                cols_number_expected = cols_number_actual
            elif cols_number_actual != cols_number_expected:
                os.remove(temp_file_path)
                del df
                raise ValueError(
                    f"File {file_path} has a different number of columns ({cols_number_actual}) than expected ({cols_number_expected})."
                )

            df[filename_column] = file_path
            print('aaa', temp_file_path)
            df.columns = df.columns.map(str)
            dask_df = dd.from_pandas(df, npartitions=1)
            dask_df.to_parquet(temp_file_path, name_function=lambda x: f"data-{file_counter}-{x}.parquet", append=False,
                               write_index=False)
            del df
            del dask_df
            file_counter += 1

        return temp_file_path + "/*.parquet"

    def _generate_temp_file_path(self, path):
        hash_name = hashlib.sha256(path.encode()).hexdigest()
        temp_file_path = os.path.join(self.temp_dir, hash_name)

        return temp_file_path

    def _name_function(counter, partition_number):
        return f"data-{counter}-{partition_number}.parquet"

    def cleanup(self):
        shutil.rmtree(self.temp_dir)
