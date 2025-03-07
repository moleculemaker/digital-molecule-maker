from config import BlockSet, config
from colorwheel.generate import generate_block_set
from colorwheel.rename_assets import rename_assets
from utils.json import rename_block_svg_urls
from utils.svg import process_block_svgs

config.block_set = BlockSet.ColorWheel

print("Renaming block SVG URLs...")
rename_block_svg_urls()

# print("Processing block SVGs...")
# process_block_svgs()

print("Generating block set...")
generate_block_set()

print("Renaming assets...")
rename_assets()
