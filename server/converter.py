import os
import pandas as pd
import tempfile
import shutil
import hashlib
import pandavro as pdx


class ReadConverter:
    CHUNKSIZE = 50000

    def __init__(self):
        self.temp_dir = tempfile.mkdtemp()

    def stata_to_parquet(self, dta_file_path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file(pd.read_stata, dta_file_path, chunksize, **kwargs)

    def sas_to_parquet(self, sas_file_path, chunksize=CHUNKSIZE, **kwargs):
        return self._read_file(pd.read_sas, sas_file_path, chunksize, **kwargs)

    def xml_to_parquet(self, xml_file_path, **kwargs):
        return self._read_file_once(pd.read_xml, xml_file_path, **kwargs)

    def spss_to_parquet(self, spss_file_path, **kwargs):
        return self._read_file_once(pd.read_spss, spss_file_path, **kwargs)

    def feather_to_parquet(self, feather_file_path, **kwargs):
        return self._read_file_once(pd.read_feather, feather_file_path, **kwargs)

    def excel_to_parquet(self, excel_file_path, **kwargs):
        return self._read_file_once(pd.read_excel, excel_file_path, **kwargs)
    
    def avro_to_parquet(self, avro_file_path, **kwargs):
        return self._read_file_once(pdx.read_avro, avro_file_path, **kwargs)

    def _read_file(self, read_func, file_path, chunksize, **kwargs):
        temp_file_path = self._generate_temp_file_path(file_path)
        wildcard_file_path = temp_file_path.replace('.parquet', '_*.parquet')

        chunk_no = 0

        for chunk in read_func(file_path, chunksize=chunksize, **kwargs):
            chunk_temp_file_path = temp_file_path.replace(
                '.parquet', f'_{chunk_no}.parquet')
            chunk.to_parquet(chunk_temp_file_path, index=False)
            chunk_no += 1

        return wildcard_file_path

    def _read_file_once(self, read_func, file_path, **kwargs):
        temp_file_path = self._generate_temp_file_path(file_path)

        df = read_func(file_path, **kwargs)
        df.to_parquet(temp_file_path, index=False)

        return temp_file_path

    def _generate_temp_file_path(self, file_path):
        file_name = os.path.basename(file_path)
        hash_name = hashlib.sha256(file_name.encode()).hexdigest()
        temp_file_path = os.path.join(self.temp_dir, hash_name + ".parquet")

        return temp_file_path

    def cleanup(self):
        shutil.rmtree(self.temp_dir)
