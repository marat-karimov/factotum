from rdkit import Chem
import pandas as pd
from rdkit.Avalon import pyAvalonTools as pyAvalonTools
import rdkit.rdBase as rkrb
import rdkit.RDLogger as rkl

# This module contains a reimplementation of RDKit's PandasTools.LoadSDF function.
# The primary purpose of this reimplementation is to add lazy loading support 
# to handle large SDF files efficiently.

logger = rkl.logger()
logger.setLevel(rkl.ERROR)
rkrb.DisableLog('rdApp.error')


def _fingerprinter(x, y):
    return pyAvalonTools.GetAvalonFP(x, isQuery=y, bitFlags=pyAvalonTools.avalonSSSBits)


def _MolPlusFingerprint(m):
    if m is not None:
        m._substructfp = _fingerprinter(m, False)
    return m


def read_sdf(
        filename,
        idName="ID",
        molColName=None,
        includeFingerprints=True,
        isomericSmiles=True,
        smilesName=None,
        embedProps=False,
        removeHs=True,
        strictParsing=False,
        sanitize=False,
        chunksize=1000,
):
    f = open(filename, "rb")
    close = f.close

    if molColName is None and smilesName is None:
        sanitize = False

    records = []
    indices = []
    for i, mol in enumerate(
            Chem.ForwardSDMolSupplier(
                f, sanitize=sanitize, removeHs=removeHs, strictParsing=strictParsing
            )
    ):
        if mol is None:
            continue
        row = dict((k, mol.GetProp(k)) for k in mol.GetPropNames())
        if molColName is not None and not embedProps:
            for prop in mol.GetPropNames():
                mol.ClearProp(prop)
        if mol.HasProp("_Name"):
            row[idName] = mol.GetProp("_Name")
        if smilesName is not None:
            try:
                row[smilesName] = Chem.MolToSmiles(mol, isomericSmiles=isomericSmiles)
            except Exception:
                row[smilesName] = None
        if molColName is not None and not includeFingerprints:
            row[molColName] = mol
        elif molColName is not None:
            row[molColName] = _MolPlusFingerprint(mol)

        records.append(row)
        indices.append(i)

        # Yield chunk if it reaches the specified size
        if len(records) >= chunksize:
            yield pd.DataFrame(records, index=indices)
            records = []
            indices = []

    # Yield any remaining records
    if records:
        yield pd.DataFrame(records, index=indices)

    if close is not None:
        close()
