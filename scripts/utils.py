import os
from math import ceil
from xml.dom.minidom import parse
from rdkit.Chem import CombineMols, MolFromSmiles


def get_svg_dimensions(url):
    dom = parse(os.path.join("./src", url))
    svg_el = dom.getElementsByTagName("svg")[0]
    return [ceil(float(v)) for v in svg_el.getAttribute("viewBox").split(" ")]


def naive_combine(all_smiles):
    mol = MolFromSmiles("")
    for smiles in all_smiles:
        mol = CombineMols(mol, MolFromSmiles(smiles))
    return mol


def resolve_functional_property_ranges(block_set):
    for prop in block_set["functionalProperties"]:
        all_values = [
            entry[prop["key"]]
            for entry in block_set["table"].values()
            if "0" not in entry["key"].split(":")
        ]
        prop["min"] = min(all_values)
        prop["max"] = max(all_values)
