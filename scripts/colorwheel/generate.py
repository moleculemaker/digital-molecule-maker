import itertools
import json
import os
from rdkit.Chem.Descriptors import MolWt
from rdkit.Chem import CanonSmiles, MolFromSmiles
from rdkit.Chem.rdMolDescriptors import CalcMolFormula

from config import config
from utils.json import compute_statistics
from utils.mol import naive_combine
from utils.svg import get_svg_dimensions

blocks_by_index = [[None], [None], [None]]


def process_blocks(data):
    processed_blocks = [[], [], []]
    for block in data["blocks"]:
        blocks_by_index[block["index"]].append(block)

        _, _, width, height = get_svg_dimensions(block["svgUrl"])
        processed_blocks[int(block["index"])].append(
            {
                "index": block["index"],
                "id": block["id"],
                "svgUrl": block["svgUrl"],
                "width": width,
                "height": height,
            }
        )

    for blocks in processed_blocks:
        blocks.sort(key=lambda b: b["id"])
    data["blocks"] = processed_blocks


def get_smiles(donor, bridge, acceptor):
    """
    Returns SMILES of either a single block or a full 3-block combo
    """
    blocks = [donor, bridge, acceptor]
    blocks = [block for block in blocks if block]

    if len(blocks) == 1:
        return CanonSmiles(blocks[0]["properties"]["smiles"])

    if not donor or not bridge or not acceptor:
        return ""

    filename = (
        config.workdir + f"/smi/{donor['id']}_{bridge['id']}_{acceptor['id']}.smi"
    )
    with open(filename) as f:
        smiles = f.read().strip()
    return smiles


def generate_lookup_table(data):
    data["table"] = {}

    for donor, bridge, acceptor in itertools.product(*blocks_by_index):
        d_id = donor["id"] if donor else 0
        b_id = bridge["id"] if bridge else 0
        a_id = acceptor["id"] if acceptor else 0
        key = f"{d_id}:{b_id}:{a_id}"

        smiles = get_smiles(donor, bridge, acceptor)
        chemical_formula = CalcMolFormula(MolFromSmiles(smiles))

        all_smiles = [
            block["properties"]["smiles"] if block else ""
            for block in (donor, bridge, acceptor)
        ]

        data["table"][key] = {
            "key": key,
            "chemicalFormula": chemical_formula.replace("+", "").replace("-", ""),
            "smiles": smiles,
            "lambdaMaxShift": (
                (donor["properties"]["lambdaMaxShift"] if donor else 0)
                + (bridge["properties"]["lambdaMaxShift"] if bridge else 0)
                + (acceptor["properties"]["lambdaMaxShift"] if acceptor else 0)
            ),
            "molecularWeight": MolWt(naive_combine(all_smiles)),
        }


def gen_lookup():
    with open(os.path.join(config.workdir, "block_set.json")) as file:
        data = json.load(file)

    process_blocks(data)
    generate_lookup_table(data)
    compute_statistics(data)

    with open(os.path.join(config.workdir, "data.json"), "w") as file:
        json.dump(data, file, indent=2)
