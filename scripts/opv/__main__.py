from config import BlockSet, config
from opv.generate import generate_block_set
from utils.json import rename_block_svg_urls
from utils.mol import generate_all_assets
from utils.svg import process_block_svgs

config.block_set = BlockSet.OPV

print("Renaming block SVG URLs...")
rename_block_svg_urls()

# print("Processing block SVGs...")
# process_block_svgs()

print("Generating block set...")
generate_block_set()

print("Generating assets...")
generate_all_assets()
