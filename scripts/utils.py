import functools
import operator
import os
import re
from collections import Counter
from math import ceil
from xml.dom.minidom import parse


def combine(key, initial):
    def combine_property(*blocks):
        return functools.reduce(operator.add, [block['properties'][key] for block in blocks if block], initial)
    return combine_property


def get_svg_dimensions(url):
    dom = parse(os.path.join('./src', url))
    svg_el = dom.getElementsByTagName('svg')[0]
    return [ceil(float(v)) for v in svg_el.getAttribute('viewBox').split(' ')]


def combine_chemical_formulas(*blocks):
    concatenated_formula = ''.join(block['properties']['chemicalFormula'] for block in blocks if block)

    if not concatenated_formula:
        return ''

    atom_counts = Counter()

    def process_substring(substring):
        match = re.search(r'([A-Za-z]+)(\d*)', substring)
        if match:
            atom = match.group(1)
            count = int(match.group(2) or '1')
            atom_counts[atom] += count

    seen = concatenated_formula[0]

    for char in concatenated_formula[1:]:
        # if it's an upper-case letter, process seen and start anew
        if char.isupper():
            process_substring(seen)
            seen = char
        else:
            seen += char

    process_substring(seen)

    ret_val = ''

    def append_one_atom(atom):
        nonlocal ret_val
        if atom in atom_counts:
            count = atom_counts[atom]
            ret_val += atom
            if count > 1:
                ret_val += str(count)

    for atom in ['C', 'H', 'F', 'N', 'O', 'S']:
        append_one_atom(atom)
        del atom_counts[atom]

    # if there's anything left, add it to the end
    for atom in atom_counts:
        append_one_atom(atom)

    return ret_val
