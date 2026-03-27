import json
import os

#from config import config
from enum import Enum
from os import path


class BlockSet(Enum):
    ColorWheel = "ColorWheel_20230504"
    OPV = "OPV_20230504"
    Chem437 = "Chem_437"
    Samys12 = "Samys12"


class Config:
    block_set = BlockSet.Samys12
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

def rename_block_svg_urls():
    def rename_svg_url(block):
        basename = os.path.basename(block["svgUrl"])
        block["svgUrl"] = f"assets/blocks/{config.block_set_id}/block_svg/{basename}"

    data_filepath = os.path.join(config.workdir, "data.json")
    if os.path.isfile(data_filepath):
        with open(data_filepath) as f:
            data = json.load(f)
            for group in data["blocks"]:
                for block in group:
                    rename_svg_url(block)

        with open(data_filepath, "w") as f:
            json.dump(data, f, indent=2)

    block_set_filepath = os.path.join(config.workdir, "block_set.json")
    if os.path.isfile(block_set_filepath):
        with open(block_set_filepath) as f:
            data = json.load(f)
            if "blocks" in data:
                for block in data["blocks"]:
                    rename_svg_url(block)

        with open(block_set_filepath, "w") as f:
            json.dump(data, f, indent=2)


def compute_statistics(block_set):
    for prop in block_set["functionalProperties"]:
        all_values = [
            entry[prop["key"]]
            for entry in block_set["table"].values()
            if "0" not in entry["key"].split(":")
        ]
        prop["min"] = min(all_values)
        prop["max"] = max(all_values)
