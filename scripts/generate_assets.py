import glob
import json
import os

from openbabel import openbabel
from tqdm import tqdm

# workdir = "./src/assets/blocks/chem-437"
workdir = "./src/assets/blocks/opv"


def generate_assets(key, smiles):
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

    with open(os.path.join(workdir, "smi", f"{key}.smi"), "w") as f:
        f.write(smiles)

    with open(os.path.join(workdir, "svg", f"{key}.svg"), "w") as f:
        f.write(svg)

    with open(os.path.join(workdir, "mol2", f"{key}.mol2"), "w") as f:
        f.write(mol2)


def main():
    with open(os.path.join(workdir, "data.json")) as f:
        block_set = json.load(f)
    for subdir in ["smi", "svg", "mol2"]:
        os.makedirs(os.path.join(workdir, subdir), exist_ok=True)
        for filepath in glob.glob(os.path.join(workdir, subdir, "*")):
            os.remove(filepath)
    for entry in tqdm(block_set["table"].values()):
        if "0" in entry["key"].split(":"):
            continue
        if "smiles" in entry:
            key = entry["key"].replace(":", "_")
            generate_assets(key, entry["smiles"])


if __name__ == "__main__":
    main()
