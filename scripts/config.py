from enum import Enum
from os import path


class BlockSet(Enum):
    ColorWheel = "ColorWheel_20230504"
    OPV = "OPV_20230504"
    Chem437 = "Chem_437"


def get_workdir(block_set):
    return path.abspath(
        path.join(path.dirname(__file__), "../src/assets/blocks", block_set.value)
    )


BLOCK_SET = BlockSet.Chem437

WORKDIR = get_workdir(BLOCK_SET)
