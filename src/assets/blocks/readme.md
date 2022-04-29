creating new block sets

open the cdx file in chemdraw
export the entire canvas as an svg
open the svg in illustrator
replace Brs with purple dots and MeN...s with yellow dots (dots can be copied from SCD year 2-mjb-dots [Recovered].ai)
FIXME create a new ai file with the dots and check it in
export one block at a time by selecting it (w/ rectangular selection) and right-clicking
rename and reorganize svg files (watch out for SVG/ directory)
edit each svg
    delete defs node, title node, group nodes
    remove existing classes
    add connection_out, connection_in classes in circles
create ts block set, setting length + width
