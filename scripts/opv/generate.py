import itertools
import json
import math
import os
import statistics

import pandas as pd
from rdkit.Chem import MolFromSmiles
from rdkit.Chem.Descriptors import MolWt
from rdkit.Chem.rdMolDescriptors import CalcMolFormula

from config import config
from utils.json import compute_statistics
from utils.mol import naive_combine
from utils.svg import get_svg_dimensions

donor_bridge_id = {}
dft_predictions = {}


def read_smiles(smi_filename):
    with open(smi_filename) as f:
        smiles = f.read().strip()
    return smiles


def generate_blocks(data):
    data["blocks"] = [[], [], []]

    block_count = [3, 7, 100]
    svg_prefix = ["S", "M", "E"]

    for i in range(3):
        for j in range(block_count[i]):
            svg_url = (
                f"assets/blocks/{config.block_set_id}/block_svg/{svg_prefix[i]}{j + 1}.svg"
            )
            _, _, width, height = get_svg_dimensions(svg_url)
            data["blocks"][i].append(
                {
                    "index": i,
                    "id": j + 1,
                    "svgUrl": svg_url,
                    "width": width,
                    "height": height,
                }
            )


def load_donor_bridge_id_mapping():
    df = pd.read_excel(
        "./Thrust4Data_DFT.xlsx",
        "DB to D-B mapping",
        header=1,
        usecols=["DB number", "D1", "B1", "D2", "B2"],
    )

    for _, (db, d1, b1, d2, b2) in df.iterrows():
        donor_bridge_id[(int(d1), int(b1))] = int(db)
        if not math.isnan(d2) and not math.isnan(b2):
            donor_bridge_id[(int(d2), int(b2))] = int(db)


def load_dft_predictions():
    df = pd.read_excel(
        "./Thrust4Data_DFT.xlsx",
        "Molec Props DB-A Unique",
        usecols=["DBA_Name", "Predicted SO", "Predicted_T80"],
    )

    for _, (dba_key, so, t80) in df.iterrows():
        dft_predictions[dba_key] = {"so": so, "t80": t80}


def get_dft_prediction(donor_id, bridge_id, acceptor_id):
    if (donor_id, bridge_id) not in donor_bridge_id:
        return None

    dba_key = f"DB_{donor_bridge_id[donor_id, bridge_id]:0>2}_A_{acceptor_id:0>3}"

    if dba_key not in dft_predictions:
        return None

    return dft_predictions[dba_key]


def get_statistical_predictions(donor_id, bridge_id, acceptor_id):
    """
    For any vacant position, either leave it empty or pick an available block,
    E.g. If the user hasn't chosen a bridge, then try B0 (no bridge), B1, B2, ..., etc.
    """
    d_choices = [donor_id] if donor_id else range(3 + 1)
    b_choices = [bridge_id] if bridge_id else range(7 + 1)
    a_choices = [acceptor_id] if acceptor_id else range(100 + 1)

    so_predictions = []
    t80_predictions = []

    for d_id, b_id, a_id in itertools.product(d_choices, b_choices, a_choices):
        pred = get_dft_prediction(d_id, b_id, a_id)
        if pred is not None:
            so_predictions.append(pred["so"])
            t80_predictions.append(pred["t80"])

    return {
        "SO_mean": statistics.fmean(so_predictions),
        "SO_stdev": statistics.stdev(so_predictions) if len(so_predictions) > 1 else 0,
        "T80_mean": statistics.fmean(t80_predictions),
        "T80_stdev": statistics.stdev(t80_predictions)
        if len(t80_predictions) > 1
        else 0,
    }


def generate_lookup_table(data):
    data["table"] = {}

    smi_index = {"0_0_0": ""}

    for d_id in range(3):
        key = f"{d_id + 1}_0_0"
        filename = config.workdir + f"/smi/{key}.smi"
        smi_index[key] = read_smiles(filename)

    for b_id in range(7):
        key = f"0_{b_id + 1}_0"
        filename = config.workdir + f"/smi/{key}.smi"
        smi_index[key] = read_smiles(filename)

    for a_id in range(100):
        key = f"0_0_{a_id + 1}"
        filename = config.workdir + f"/smi/{key}.smi"
        smi_index[key] = read_smiles(filename)

    for d_id, b_id, a_id in itertools.product(
        range(3 + 1), range(7 + 1), range(100 + 1)
    ):
        key = f"{d_id}:{b_id}:{a_id}"

        all_smiles = [
            smi_index[key] for key in [f"{d_id}_0_0", f"0_{b_id}_0", f"0_0_{a_id}"]
        ]

        smi_filename = config.workdir + f"/smi/{d_id}_{b_id}_{a_id}.smi"
        if not os.path.isfile(smi_filename):
            print(f"{smi_filename} does not exist")
            smiles = ""
        else:
            smiles = read_smiles(smi_filename)

        mol = MolFromSmiles(smiles)

        data["table"][key] = {
            "key": key,
            "chemicalFormula": CalcMolFormula(mol),
            "smiles": smiles,
            "molecularWeight": MolWt(mol)
            if smiles
            else MolWt(naive_combine(all_smiles)),
            **get_statistical_predictions(d_id, b_id, a_id),
        }


def generate_block_set():
    with open(os.path.join(config.workdir, "block_set.json")) as file:
        data = json.load(file)

    generate_blocks(data)
    load_donor_bridge_id_mapping()
    load_dft_predictions()
    generate_lookup_table(data)
    compute_statistics(data)

    with open(os.path.join(config.workdir, "data.json"), "w") as file:
        json.dump(data, file, indent=2)
