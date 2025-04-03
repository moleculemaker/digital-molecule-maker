import glob
import json
import os

from rdkit.Chem import CombineMols, MolFromSmiles
from openbabel import openbabel
from tqdm import tqdm

from config import config


def naive_combine(all_smiles):
    mol = MolFromSmiles("")
    for smiles in all_smiles:
        mol = CombineMols(mol, MolFromSmiles(smiles))
    return mol


def generate_assets(key, smiles):
    if "0" in key.split("_"):  # the combination is not complete
        return

    ob_conv = openbabel.OBConversion()
    ob_conv.SetInFormat("smi")

    mol = openbabel.OBMol()
    ob_conv.ReadString(mol, smiles)
    mol.AddHydrogens()
    openbabel.OBBuilder().Build(mol)

    ob_conv.SetOutFormat("mol2")
    mol2 = ob_conv.WriteString(mol)

    ob_conv.SetOutFormat("svg")
    svg = ob_conv.WriteString(mol)

    with open(os.path.join(config.workdir, "svg", f"{key}.svg"), "w") as f:
        f.write(svg)

    with open(os.path.join(config.workdir, "mol2", f"{key}.mol2"), "w") as f:
        f.write(mol2)


def generate_all_assets():
    with open(os.path.join(config.workdir, "data.json")) as f:
        data = json.load(f)
    for subdir in ["svg", "mol2"]:
        os.makedirs(os.path.join(config.workdir, subdir), exist_ok=True)
        for filepath in glob.glob(os.path.join(config.workdir, subdir, "*")):
            os.remove(filepath)
    for entry in tqdm(data["table"].values()):
        if "smiles" in entry:
            key = entry["key"].replace(":", "_")
            smiles = entry["smiles"]
            generate_assets(key, smiles)
