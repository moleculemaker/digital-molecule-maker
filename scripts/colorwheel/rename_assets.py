"""
This script only needs to be run once
"""

import itertools
import os

from config import config, BlockSet


def old_key(s_id, m_id, e_id):
    s_key = chr(ord("A") + s_id - 1)
    e_key = chr(ord("K") + e_id - 1)
    return f"{s_key}_{m_id}_{e_key}"


def new_key(s_id, m_id, e_id):
    return f"{s_id}_{m_id}_{e_id}"


def rename_assets():
    config.block_set = BlockSet.ColorWheel

    for s_id, m_id, e_id in itertools.product(range(1, 11), range(1, 11), range(1, 11)):
        k_old = old_key(s_id, m_id, e_id)
        k_new = new_key(s_id, m_id, e_id)
        if os.path.isfile(os.path.join(config.workdir, "mol2", f"{k_old}.mol2")):
            os.rename(
                os.path.join(config.workdir, "mol2", f"{k_old}.mol2"),
                os.path.join(config.workdir, "mol2", f"{k_new}.mol2"),
            )
        if os.path.isfile(os.path.join(config.workdir, "smi", f"{k_old}.smi")):
            os.rename(
                os.path.join(config.workdir, "smi", f"{k_old}.smi"),
                os.path.join(config.workdir, "smi", f"{k_new}.smi"),
            )
        if os.path.isfile(os.path.join(config.workdir, "svg", f"{k_old}.svg")):
            os.rename(
                os.path.join(config.workdir, "svg", f"{k_old}.svg"),
                os.path.join(config.workdir, "svg", f"{k_new}.svg"),
            )
