from cx_Freeze import setup, Executable

import sys

platform = sys.platform

build_folder = platform + "_python"


additional_modules = []



build_exe_options = {
    "packages": ["pyarrow.vendored.version", "pyreadstat"],
    "excludes": ["tkinter", "PyQt4.QtSql", "sqlite3", 
                                  "scipy.lib.lapack.flapack",
                                  "PyQt4.QtNetwork",
                                  "PyQt4.QtScript",
                                  "numpy.core._dotblas", 
                                  "PyQt5"],
    "include_files": [],
    "includes": additional_modules,
    "build_exe": build_folder
}


executables = [Executable(script="main.py",
                          target_name="Factotum",
                          copyright="Copyright (C) 2023 Factotum")]

setup(
    name="Factotum",
    version="1.0",
    description="SQL powered tabular data editor",
    options={"build_exe": build_exe_options},
    executables=executables
)
