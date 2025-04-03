import json
import os

import pandas as pd

from config import config
from utils.json import compute_statistics
from utils.svg import get_svg_dimensions

input_filepath = "/Users/wenqihe2/Documents/projects/dmm/data/chem-437/blocks.xlsx"

data = {
    "id": "Chem_437",
    "moleculeSize": 3,
    "labelProperty": {
        "key": "chemicalFormula",
        "label": "Chemical Formula",
        "displayStrategy": "chemicalFormula",
    },
    "primaryProperty": {
        "key": "TPSA",
        "label": "Total Polar Surface Area",
        "displayStrategy": "default",
    },
    "functionalProperties": [
        {
            "key": "TPSA",
            "label": "Total Polar Surface Area",
            "displayStrategy": "default",
        },
        {
            "key": "cLogP",
            "label": "Calculated Partition Coefficient",
            "displayStrategy": "default",
        },
    ],
    "firstTierProperties": [
        {
            "key": "chemicalFormula",
            "label": "Chemical Formula",
            "displayStrategy": "chemicalFormula",
        },
        {
            "key": "TPSA",
            "label": "Total Polar Surface Area",
            "displayStrategy": "default",
        },
    ],
    "secondTierProperties": [
        {"key": "smiles", "label": "SMILES", "displayStrategy": "default"},
        {
            "key": "molecularWeight",
            "label": "Molecular Weight",
            "displayStrategy": "default",
        },
    ],
    "blocks": [[], [], []],
    "table": {},
}


def add_lookup_entry(key, *, smiles, chemical_formula, molecular_weight, tpsa, c_log_p):
    data["table"][key] = {
        "key": key,
        "smiles": smiles,
        "chemicalFormula": chemical_formula,
        "molecularWeight": molecular_weight,
        "TPSA": tpsa,
        "cLogP": c_log_p,
    }


def process_blocks(df):
    for index, row in df.iterrows():
        pos: str = row["Position"]
        block_index = 0 if pos[0] == "S" else 1 if pos[0] == "M" else 2
        block_id = int(pos[1:])

        svg_path = f"assets/blocks/Chem_437/block_svg/{pos}.svg"
        _, _, width, height = get_svg_dimensions(svg_path)
        data["blocks"][block_index].append(
            {
                "index": block_index,
                "id": block_id,
                "svgUrl": svg_path,
                "width": width,
                "height": height,
            }
        )

        block_ids = [0, 0, 0]
        block_ids[block_index] = block_id
        key = ":".join(str(i) for i in block_ids)

        add_lookup_entry(
            key,
            # smiles=block['SMILES w/ connection(s)'],
            smiles=row["SMILES w/ H replacing RG"],
            chemical_formula=row["Formula"],
            molecular_weight=row["MW"],
            tpsa=row["TPSA"],
            c_log_p=row["cLogP"],
        )


def process_products(df):
    for index, row in df.iterrows():
        s_id = int(row["Start"][1:])
        m_id = int(row["Middle"][1:])
        e_id = int(row["End"][1:])
        key = f"{s_id}:{m_id}:{e_id}"

        add_lookup_entry(
            key,
            # smiles=block['SMILES w/ connection(s)'],
            smiles=row["SMILES"],
            chemical_formula=row["Formula"],
            molecular_weight=row["MW"],
            tpsa=row["TPSA"],
            c_log_p=row["cLogP"],
        )


def generate_block_set():
    df = pd.read_excel(input_filepath, sheet_name=None)

    process_blocks(df["Blocks"])
    process_products(df["Products"])
    compute_statistics(data)

    with open(os.path.join(config.workdir, "data.json"), "w") as f:
        json.dump(data, f, indent=2)
