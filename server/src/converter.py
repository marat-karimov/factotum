import os
import pandas as pd
import tempfile
import shutil
import hashlib
import pandavro as pdx
from server.src.orc import read_orc
from server.src.read_config import filename_column
from glob import glob

class ReadConverter:
    CHUNKSIZE = 50000

    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()

    def stata_to_csv(self, path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file_chunks(pd.read_stata, path, chunksize, **kwargs)

    def sas_to_csv(self, path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file_chunks(pd.read_sas, path, chunksize, **kwargs)

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

    def _read_file_chunks(self, read_func, path, chunksize, **kwargs):
        temp_file_path = self._generate_temp_file_path(path)
        first_chunk = True

        for file_path in glob(path):
            for chunk in read_func(file_path, chunksize=chunksize, **kwargs):
                chunk[filename_column] = file_path
                chunk.to_csv(temp_file_path, mode='a', header=first_chunk, index=False)
                first_chunk = False

        return temp_file_path

    def _read_file_once(self, read_func, path, **kwargs):
        temp_file_path = self._generate_temp_file_path(path)

        first_file = True
        cols_number_expected = None

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
            df.to_csv(temp_file_path, mode='a', header=first_file, index=False)
            first_file = False
            del df

        return temp_file_path

    def _generate_temp_file_path(self, path):
        hash_name = hashlib.sha256(path.encode()).hexdigest()
        temp_file_path = os.path.join(self.temp_dir, hash_name + ".csv")

        return temp_file_path

    def cleanup(self):
        shutil.rmtree(self.temp_dir)
