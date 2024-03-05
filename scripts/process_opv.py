import itertools
import json
import math
import os
import statistics

import pandas as pd

from utils import get_svg_dimensions, combine_chemical_formulas, combine

workdir = './src/assets/blocks/opv'

with open(os.path.join(workdir, 'blocks.json')) as file:
    block_set = json.load(file)

blocks_by_index = [[None], [None], [None]]
donor_bridge_id = {}
dft_predictions = {}


def process_blocks():
    processed_blocks = [[], [], []]
    for block in block_set['blocks']:
        blocks_by_index[block['index']].append(block)

        _, _, width, height = get_svg_dimensions(block['svgUrl'])
        processed_blocks[int(block['index'])].append({
            'index': block['index'],
            'id': block['id'],
            'svgUrl': block['svgUrl'],
            'width': width,
            'height': height
        })

    for blocks in processed_blocks:
        blocks.sort(key=lambda b: b['id'])
    block_set['blocks'] = processed_blocks


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
    d_choices = [donor_id] if donor_id else range(len(blocks_by_index[0]) + 1)
    b_choices = [bridge_id] if bridge_id else range(len(blocks_by_index[1]) + 1)
    a_choices = [acceptor_id] if acceptor_id else range(len(blocks_by_index[2]) + 1)

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

    for donor, bridge, acceptor in itertools.product(*blocks_by_index):
        d_id = donor['id'] if donor else 0
        b_id = bridge['id'] if bridge else 0
        a_id = acceptor['id'] if acceptor else 0
        key = f'{d_id}:{b_id}:{a_id}'

        block_set['table'][key] = {
            'key': key,
            'chemicalFormula': combine_chemical_formulas(donor, bridge, acceptor),
            'smiles': combine('smiles', '')(donor, bridge, acceptor),
            'molecularWeight': combine('molecularWeight', 0)(donor, bridge, acceptor),
            **get_statistical_predictions(d_id, b_id, a_id)
        }


def resolve_functional_property_ranges():
    for prop in block_set['functionalProperties']:
        all_values = [entry[prop['key']] for entry in block_set['table'].values()
                      if '0' not in entry['key'].split(':')]
        prop['min'] = min(all_values)
        prop['max'] = max(all_values)


process_blocks()
load_donor_bridge_id_mapping()
load_dft_predictions()
generate_lookup_table()
resolve_functional_property_ranges()

with open(os.path.join(workdir, 'data.json'), 'w') as file:
    json.dump(block_set, file, indent=2)
