import itertools
import json
import os
from rdkit.Chem.Descriptors import MolWt
from rdkit.Chem import CanonSmiles, MolFromSmiles
from rdkit.Chem.rdMolDescriptors import CalcMolFormula

from utils import get_svg_dimensions, naive_combine

workdir = './src/assets/blocks/10x10x10palette'

with open(os.path.join(workdir, 'block_set.json')) as file:
    block_set = json.load(file)

blocks_by_index = [[None], [None], [None]]


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


def get_smiles(donor, bridge, acceptor):
    """
    Returns SMILES of either a single block or a full 3-block combo
    """
    blocks = [donor, bridge, acceptor]
    blocks = [block for block in blocks if block]

    if len(blocks) == 1:
        return CanonSmiles(blocks[0]['properties']['smiles'])

    if not donor or not bridge or not acceptor:
        return ''

    start = chr(ord('A') + (donor['id'] - 1))
    mid = bridge['id']
    end = chr(ord('K') + (acceptor['id'] - 1))

    filename = workdir + f'/smi/{start}_{mid}_{end}.smi'
    with open(filename) as f:
        smiles = f.read().strip()
    return smiles


def generate_lookup_table():
    block_set['table'] = {}

    for donor, bridge, acceptor in itertools.product(*blocks_by_index):
        d_id = donor['id'] if donor else 0
        b_id = bridge['id'] if bridge else 0
        a_id = acceptor['id'] if acceptor else 0
        key = f'{d_id}:{b_id}:{a_id}'

        smiles = get_smiles(donor, bridge, acceptor)
        chemical_formula = CalcMolFormula(MolFromSmiles(smiles))

        all_smiles = [block['properties']['smiles'] if block else '' for block in (donor, bridge, acceptor)]

        block_set['table'][key] = {
            'key': key,
            'chemicalFormula': chemical_formula.replace('+', '').replace('-', ''),
            'smiles': smiles,
            'lambdaMaxShift': (
                (donor['properties']['lambdaMaxShift'] if donor else 0)
                + (bridge['properties']['lambdaMaxShift'] if bridge else 0)
                + (acceptor['properties']['lambdaMaxShift'] if acceptor else 0)
            ),
            'molecularWeight': MolWt(naive_combine(all_smiles))
        }


def resolve_functional_property_ranges():
    for prop in block_set['functionalProperties']:
        all_values = [entry[prop['key']] for entry in block_set['table'].values()
                      if '0' not in entry['key'].split(':')]
        prop['min'] = min(all_values)
        prop['max'] = max(all_values)


process_blocks()
generate_lookup_table()
resolve_functional_property_ranges()

with open(os.path.join(workdir, 'data.json'), 'w') as file:
    json.dump(block_set, file, indent=2)
