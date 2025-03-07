import json
import os

# block_set_id = "ColorWheel_20230504"
# block_set_id = "OPV_20230504"
block_set_id = "Chem_437"
workdir = f"./src/assets/blocks/{block_set_id}"


def rename_svg_url(block):
    basename = os.path.basename(block["svgUrl"])
    block["svgUrl"] = f"assets/blocks/{block_set_id}/block_svg/{basename}"


def main():
    with open(os.path.join(workdir, "data.json")) as f:
        block_set = json.load(f)
        for group in block_set["blocks"]:
            for block in group:
                rename_svg_url(block)

    with open(os.path.join(workdir, "data.json"), "w") as f:
        json.dump(block_set, f, indent=2)


if __name__ == "__main__":
    main()
