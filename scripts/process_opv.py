import itertools
import json
import math
import os
import statistics
from typing import List

import pandas as pd
from rdkit.Chem import MolFromSmiles
from rdkit.Chem.Descriptors import MolWt
from rdkit.Chem.rdMolDescriptors import CalcMolFormula

from utils import get_svg_dimensions, naive_combine

workdir = './src/assets/blocks/opv'

with open(os.path.join(workdir, 'block_set.json')) as file:
    block_set = json.load(file)

smiles_by_index: List[List[str]] = [[''], [''], ['']]
donor_bridge_id = {}
dft_predictions = {}


def read_smiles(smi_filename):
    with open(smi_filename) as f:
        smiles = f.read().strip()
    return smiles


def generate_blocks():
    block_set['blocks'] = [[], [], []]

    block_count = [3, 7, 100]
    svg_prefix = ['S', 'M', 'E']
    smi_prefix = ['D', 'B', 'A']

    for i in range(3):
        for j in range(block_count[i]):
            smi_filename = workdir + f'/smi/{smi_prefix[i]}_{j + 1}.smi'
            smiles_by_index[i].append(read_smiles(smi_filename))
            svg_url = f"assets/blocks/opv/block_svg/{svg_prefix[i]}{j + 1}.svg"
            _, _, width, height = get_svg_dimensions(svg_url)
            block_set['blocks'][i].append({
                'index': i,
                'id': j + 1,
                'svgUrl': svg_url,
                'width': width,
                'height': height
            })


def load_donor_bridge_id_mapping():
    df = pd.read_excel('./Thrust4Data_DFT.xlsx',
                       'DB to D-B mapping',
                       header=1,
                       usecols=['DB number', 'D1', 'B1', 'D2', 'B2'],
                       )

    for _, (db, d1, b1, d2, b2) in df.iterrows():
        donor_bridge_id[(int(d1), int(b1))] = int(db)
        if not math.isnan(d2) and not math.isnan(b2):
            donor_bridge_id[(int(d2), int(b2))] = int(db)


def load_dft_predictions():
    df = pd.read_excel('./Thrust4Data_DFT.xlsx',
                       'Molec Props DB-A Unique',
                       usecols=['DBA_Name', 'Predicted SO', 'Predicted_T80'])

    for _, (dba_key, so, t80) in df.iterrows():
        dft_predictions[dba_key] = {'so': so, 't80': t80}


def get_dft_prediction(donor_id, bridge_id, acceptor_id):
    if (donor_id, bridge_id) not in donor_bridge_id:
        return None

    dba_key = f'DB_{donor_bridge_id[donor_id, bridge_id]:0>2}_A_{acceptor_id:0>3}'

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
            so_predictions.append(pred['so'])
            t80_predictions.append(pred['t80'])

    return {
        'SO_mean': statistics.fmean(so_predictions),
        'SO_stdev': statistics.stdev(so_predictions) if len(so_predictions) > 1 else 0,
        'T80_mean': statistics.fmean(t80_predictions),
        'T80_stdev': statistics.stdev(t80_predictions) if len(t80_predictions) > 1 else 0,
    }


def generate_lookup_table():
    block_set['table'] = {}

    for d_id, b_id, a_id in itertools.product(range(3 + 1), range(7 + 1), range(100 + 1)):
        key = f'{d_id}:{b_id}:{a_id}'

        d_smiles = smiles_by_index[0][d_id]
        b_smiles = smiles_by_index[1][b_id]
        a_smiles = smiles_by_index[2][a_id]

        all_smiles = [d_smiles, b_smiles, a_smiles]

        # the SMILES strings contain reactive functional groups. can't combine them directly
        valid_smiles = [smi for smi in all_smiles if smi]
        smiles = valid_smiles[0] if len(valid_smiles) == 1 else ''

        block_set['table'][key] = {
            'key': key,
            'chemicalFormula': CalcMolFormula(MolFromSmiles(smiles)),
            'smiles': smiles,
            'molecularWeight': MolWt(naive_combine(all_smiles)),
            **get_statistical_predictions(d_id, b_id, a_id)
        }


def resolve_functional_property_ranges():
    for prop in block_set['functionalProperties']:
        all_values = [entry[prop['key']] for entry in block_set['table'].values()
                      if '0' not in entry['key'].split(':')]
        prop['min'] = min(all_values)
        prop['max'] = max(all_values)


generate_blocks()
load_donor_bridge_id_mapping()
load_dft_predictions()
generate_lookup_table()
resolve_functional_property_ranges()

with open(os.path.join(workdir, 'data.json'), 'w') as file:
    json.dump(block_set, file, indent=2)
