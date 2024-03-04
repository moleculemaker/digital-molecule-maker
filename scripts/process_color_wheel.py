import itertools
import json
import os

from utils import get_svg_dimensions, combine_chemical_formulas, combine

workdir = '../src/assets/blocks/10x10x10palette'

with open(os.path.join(workdir, 'blocks.json')) as file:
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
            'lambdaMaxShift': combine('lambdaMaxShift', 0)(donor, bridge, acceptor),
            'molecularWeight': combine('molecularWeight', 0)(donor, bridge, acceptor),
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
