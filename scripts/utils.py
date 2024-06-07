import os
from math import ceil
from xml.dom.minidom import parse
from rdkit.Chem import CombineMols, MolFromSmiles


def get_svg_dimensions(url):
    dom = parse(os.path.join('./src', url))
    svg_el = dom.getElementsByTagName('svg')[0]
    return [ceil(float(v)) for v in svg_el.getAttribute('viewBox').split(' ')]


def naive_combine(all_smiles):
    mol = MolFromSmiles('')
    for smiles in all_smiles:
        mol = CombineMols(mol, MolFromSmiles(smiles))
    return mol
