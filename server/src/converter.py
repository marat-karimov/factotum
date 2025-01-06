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
        return self._read_file(pd.read_stata, path, chunksize, **kwargs)

    def sas_to_csv(self, path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file(pd.read_sas, path, chunksize, **kwargs)

    def sdf_to_csv(self, path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file(read_sdf, path, chunksize, **kwargs)

    def xml_to_csv(self, path, **kwargs):
        return self._read_file(pd.read_xml, path, None, **kwargs)

    def spss_to_csv(self, path, **kwargs):
        return self._read_file(pd.read_spss, path, None, **kwargs)

    def feather_to_csv(self, path, **kwargs):
        return self._read_file(pd.read_feather, path, None, **kwargs)

    def excel_to_csv(self, path, **kwargs):
        return self._read_file(pd.read_excel, path, None, **kwargs)

    def orc_to_csv(self, path, **kwargs):
        return self._read_file(read_orc, path, None, **kwargs)

    def hdf_to_csv(self, path, **kwargs):
        return self._read_file(pd.read_hdf, path, None, **kwargs)

    def avro_to_csv(self, path, **kwargs):
        return self._read_file(pdx.read_avro, path, None, **kwargs)

    def por_to_csv(self, path, **kwargs):
        return self._read_file(read_por, path, None, **kwargs)

    def xpt_to_csv(self, path, **kwargs):
        return self._read_file(read_xpt, path, None, **kwargs)

    def pkl_to_csv(self, path, **kwargs):
        return self._read_file(pd.read_pickle, path, None, **kwargs)

    def _read_file(self, read_func, path, chunksize, **kwargs):
        temp_subdir = self._generate_temp_subdir(path)
        self._remove_temp_subdir(temp_subdir)

        cols_number_expected = None
        file_counter = 0

        for file_path in glob(path):
            data_iterator = (
                read_func(file_path, chunksize=chunksize, **kwargs)
                if chunksize
                else [read_func(file_path, **kwargs)]
            )

            for df in data_iterator:
                cols_number_expected = self._assert_columns_match(
                    df=df,
                    file_path=file_path,
                    cols_number_expected=cols_number_expected,
                    temp_subdir=temp_subdir,
                )
                self._save_df_to_parquet(
                    df=df,
                    file_path=file_path,
                    temp_subdir=temp_subdir,
                    file_counter=file_counter,
                )
                file_counter += 1

        return temp_subdir + "/*.parquet"

    def _save_df_to_parquet(self, df, file_path, temp_subdir, file_counter):
        df[filename_column] = file_path
        df.columns = df.columns.map(str)
        dask_df = dd.from_pandas(df, npartitions=1)
        dask_df.to_parquet(temp_subdir, name_function=lambda x: f"data-{file_counter}-{x}.parquet", write_index=False)
        del df
        del dask_df

    def _assert_columns_match(self, df, file_path, cols_number_expected, temp_subdir):
        cols_number_actual = len(df.columns)
        if cols_number_expected is None:
            return cols_number_actual
        if cols_number_actual != cols_number_expected:
            self._remove_temp_subdir(temp_subdir)
            del df
            raise ValueError(
                f"File {file_path} has a different number of columns ({cols_number_actual}) than expected ({cols_number_expected})."
            )
        return cols_number_expected

    def _generate_temp_subdir(self, path):
        hash_name = hashlib.sha256(path.encode()).hexdigest()
        temp_subdir = os.path.join(self.temp_dir, hash_name)
        return temp_subdir

    def cleanup(self):
        shutil.rmtree(self.temp_dir)

    @staticmethod
    def _remove_temp_subdir(temp_subdir):
        if os.path.exists(temp_subdir):
            shutil.rmtree(temp_subdir)
