import itertools
import json
import os

workdir = "./src/assets/blocks/10x10x10palette"


def rename_svg_url(block):
    print(block['svgUrl'])
    print(os.path.basename(block['svgUrl']))


def main():
    with open(os.join(workdir, 'data.json')) as f:
        block_set = json.load(f)
        for group in block_set['blocks']:
            for block in group:
                rename_svg_url(block)


    with open(os.join(workdir, 'data.json'), 'w') as f:
        json.dump(block_set, f, indent=2)


if __name__ == "__main__":
    main()
