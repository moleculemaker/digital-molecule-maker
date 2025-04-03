from enum import Enum
from os import path


class BlockSet(Enum):
    ColorWheel = "ColorWheel_20230504"
    OPV = "OPV_20230504"
    Chem437 = "Chem_437"


class Config:
    block_set = BlockSet.ColorWheel
    src_dir = path.join(path.dirname(__file__), "../src")

    @property
    def block_set_id(self):
        return self.block_set.value

    @property
    def workdir(self):
        return path.abspath(
            path.join(
                path.dirname(__file__), "../src/assets/blocks", self.block_set.value
            )
        )


config = Config()
