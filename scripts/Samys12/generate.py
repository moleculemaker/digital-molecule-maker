import json
import os
import pandas as pd
import glob
import re
from typing import List, Tuple
from xml.dom.minidom import parse, Text, Element

import numpy as np

# from config import config
from enum import Enum
from os import path
from pathlib import Path  # <-- added

class BlockSet(Enum):
    ColorWheel = "ColorWheel_20230504"
    OPV = "OPV_20230504"
    Chem437 = "Chem_437"
    Samys12 = "Samys12"

class Config:
    block_set = BlockSet.Samys12

    # Anchor to project root: scripts/Samys12/__main__.py -> parents[2] == project root
    PROJECT_ROOT = Path(__file__).resolve().parents[2]
    _SRC_DIR = PROJECT_ROOT / "src"

    @property
    def block_set_id(self):
        return self.block_set.value

    @property
    def src_dir(self):
        # e.g., /.../digital-molecule-maker-develop/src
        return str(self._SRC_DIR)

    @property
    def workdir(self):
        # e.g., /.../digital-molecule-maker-develop/src/assets/blocks/Samys12
        return str(self._SRC_DIR / "assets" / "blocks" / self.block_set.value)

config = Config()

# from utils.json import compute_statistics
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

# from utils.svg import get_svg_dimensions
def process_path(node: Element, parent_transform=np.identity(3)):
    if "fill" in node.attributes:
        node.removeAttribute("fill")

    transform = parse_transform(node)
    points = parse_path(node)
    return [parent_transform @ transform @ (p[0], p[1], 1) for p in points]

def get_svg_dimensions(url: str):
    # handle accidental leading "/" so we don't ignore src_dir
    joined = os.path.join(config.src_dir, url.lstrip("/"))
    #print(joined)
    dom = parse(joined)
    svg_el = dom.getElementsByTagName("svg")[0]
    return [np.ceil(float(v)) for v in svg_el.getAttribute("viewBox").split(" ")]

def tokenize(expression: str) -> List[str]:
    return re.findall(r"[+-]?(?:\d*\.\d+|\d+)|[A-Za-z]+", expression)

def parse_transform(node: Element) -> np.array:
    if "transform" not in node.attributes:
        return np.identity(3)

    tokens = tokenize(node.getAttribute("transform"))
    if tokens[0] != "matrix" or len(tokens) != 7:
        raise SyntaxError("transform matrix must have 6 components")

    a, b, c, d, tx, ty = [float(n) for n in tokens[1:]]
    return np.array([[a, c, tx], [b, d, ty], [0, 0, 1]])

def get_arc_bbox(
    x1: float,
    y1: float,
    x2: float,
    y2: float,
    rx: float,
    ry: float,
    theta: float,
    large_arc_flag: bool,
    sweep_flag: bool,
) -> List[Tuple[float, float]]:
    """
    See: https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    """

    x1_ = (np.cos(theta) * (x1 - x2)) / 2 + (np.sin(theta) * (y1 - y2)) / 2
    y1_ = (-np.sin(theta) * (x1 - x2)) / 2 + (np.cos(theta) * (y1 - y2)) / 2

    factor = np.sqrt(
        max(
            0,
            (rx**2 * ry**2 - rx**2 * y1_**2 - ry**2 * x1_**2)
            / (
                rx**2 * y1_**2 + ry**2 * x1_**2
            ),  # this could become negative, probably due to rounding error
        )
    )
    if large_arc_flag == sweep_flag:
        factor = -factor

    cx_ = (factor * rx * y1_) / ry
    cy_ = (-factor * ry * x1_) / rx

    cx = np.cos(theta) * cx_ - np.sin(theta) * cy_ + (x1 + x2) / 2
    cy = np.sin(theta) * cx_ + np.cos(theta) * cy_ + (y1 + y2) / 2

    def angle(ux: float, uy: float, vx: float, vy: float) -> float:
        sign = 1 if ux * vy - uy * vx > 0 else -1
        return (
            np.arccos(
                (ux * vx + uy * vy) / (np.sqrt(ux**2 + uy**2) * np.sqrt(vx**2 + vy**2))
            )
            * sign
        )

    start_angle = angle(1, 0, x1_ - cx_, y1_ - cy_)
    delta = angle(x1_ - cx_, y1_ - cy_, -x1_ - cx_, -y1_ - cy_)

    if sweep_flag and delta < 0:
        delta += 2 * np.pi
    elif not sweep_flag and delta > 0:
        delta -= 2 * np.pi
    end_angle = start_angle + delta

    counterclockwise = not sweep_flag

    r = max(rx, ry)

    # the bounding box of the circumcircle of the (entire) ellipse
    return [(cx - r, cy - r), (cx - r, cy + r), (cx + r, cy - r), (cx + r, cy + r)]

def parse_path(node: Element) -> List[Tuple[float, float]]:
    if "d" not in node.attributes:
        return []

    points = []
    tokens = tokenize(node.getAttribute("d"))

    while tokens:
        if tokens[0] == "M" or tokens[0] == "L":
            i = 1
            while not tokens[i].isalpha():
                points.append((float(tokens[i]), float(tokens[i + 1])))
                i += 2
            tokens = tokens[i:]
        elif tokens[0] == "A":
            i = 1
            while not tokens[i].isalpha():
                rx, ry, theta, large_arc_flag, sweep_flag, x2, y2 = [
                    float(n) for n in tokens[i : i + 7]
                ]
                x1, y1 = points[-1]
                points += get_arc_bbox(
                    x1,
                    y1,
                    x2,
                    y2,
                    rx,
                    ry,
                    theta,
                    bool(large_arc_flag),
                    bool(sweep_flag),
                )
                points.append((x2, y2))
                i += 7
            tokens = tokens[i:]
        elif tokens[0] == "Z":
            break
        else:
            raise SyntaxError(f"path command `{tokens[0]}` not supported")

    return points

def process_text(node: Element, parent_transform=np.identity(3)):
    if "fill" in node.attributes:
        node.removeAttribute("fill")

    text = ""
    for child in node.childNodes:
        if isinstance(child, Text):
            text += child.wholeText

    font_size = node.getAttribute("font-size")

    if font_size.endswith("px"):
        font_size = font_size[:-2]
    font_size = float(font_size) if font_size else 100

    # estimate text dimensions using font size (TODO: this is not accurate at all)
    h = font_size * 0.8
    w = font_size * 0.5 * len(text)

    x = float(node.getAttribute("x"))
    y = float(node.getAttribute("y"))

    points = [(x, y - h), (x + w, y - h), (x + w, y), (x, y)]

    transform = parse_transform(node)

    return [parent_transform @ transform @ (p[0], p[1], 1) for p in points]

def process_group(group: Element, parent_transform=np.identity(3)):
    all_points = []

    transform = parent_transform @ parse_transform(group)

    for node in group.childNodes:
        if isinstance(node, Element):
            if node.tagName == "g":
                all_points += process_group(node, transform)
            elif node.tagName == "path":
                all_points += process_path(node, transform)
            elif node.tagName == "text":
                all_points += process_text(node, transform)
            else:
                raise SyntaxError(f"tag name {node.tagName} not supported")

    return all_points

def get_svg_bbox(node: Element):
    all_points = process_group(node)

    min_x = np.min([p[0] / p[2] for p in all_points])
    max_x = np.max([p[0] / p[2] for p in all_points])
    min_y = np.min([p[1] / p[2] for p in all_points])
    max_y = np.max([p[1] / p[2] for p in all_points])

    return min_x, min_y, max_x - min_x, max_y - min_y

def add_class_names(group: Element, class_names: List[str]):
    for node in group.childNodes:
        if isinstance(node, Element):
            if node.tagName == "g":
                add_class_names(node, class_names)
            elif node.tagName == "path":
                if "d" in node.attributes and "A" in node.getAttribute("d"):
                    # assume elliptical arcs are actually circles (i.e. connection points)
                    node.setAttribute("stroke-width", "18px")
                    node.setAttribute("class", class_names[0])
                    class_names.pop(0)

def process_svg(filename, class_names):
    xml = parse(filename)
    svg = xml.getElementsByTagName("svg")[0]

    add_class_names(svg, class_names)
    x, y, width, height = get_svg_bbox(svg)

    padding = 2
    x -= padding
    y -= padding
    width += 2 * padding
    height += 2 * padding

    if "width" in svg.attributes:
        svg.removeAttribute("width")
    if "height" in svg.attributes:
        svg.removeAttribute("height")

    svg.setAttribute("viewBox", f"0 0 {width} {height}")

    if x and y:
        g = xml.createElement("g")
        g.childNodes = svg.childNodes
        g.setAttribute("transform", f"matrix(1 0 0 1 {-x} {-y})")

        newline = xml.createTextNode("\n")
        svg.childNodes = [newline, g, newline]

    with open(filename, "w") as out_file:
        svg.writexml(out_file)
        print(f"saved to {filename}")

def process_block_svgs():
    for filepath in glob.glob(os.path.join(config.workdir, "block_svg", "*.svg")):
        process_svg(filepath, ["connection_in", "connection_out"])

input_filepath = "/Users/amd/Downloads/blocks_samy.xlsx"

data = {
    "id": "Samys12",
    "moleculeSize": 3,
    "labelProperty": {
        "key": "chemicalFormula",
        "label": "Chemical Formula",
        "displayStrategy": "chemicalFormula",
    },
    "primaryProperty": {
        "key": "TPSA",
        "label": "Total Polar Surface Area",
        "displayStrategy": "default",
    },
    "functionalProperties": [
        {
            "key": "TPSA",
            "label": "Total Polar Surface Area",
            "displayStrategy": "default",
        },
        {
            "key": "cLogP",
            "label": "Calculated Partition Coefficient",
            "displayStrategy": "default",
        },
    ],
    "firstTierProperties": [
        {
            "key": "chemicalFormula",
            "label": "Chemical Formula",
            "displayStrategy": "chemicalFormula",
        },
        {
            "key": "TPSA",
            "label": "Total Polar Surface Area",
            "displayStrategy": "default",
        },
    ],
    "secondTierProperties": [
        {"key": "smiles", "label": "SMILES", "displayStrategy": "default"},
        {
            "key": "molecularWeight",
            "label": "Molecular Weight",
            "displayStrategy": "default",
        },
    ],
    "blocks": [[], [], []],
    "table": {},
}

def add_lookup_entry(key, *, smiles, chemical_formula, molecular_weight, tpsa, c_log_p):
    data["table"][key] = {
        "key": key,
        "smiles": smiles,
        "chemicalFormula": chemical_formula,
        "molecularWeight": molecular_weight,
        "TPSA": tpsa,
        "cLogP": c_log_p,
    }

import os, re, numpy as np  # make sure these are imported at top of your file

_POS_RE = re.compile(r"^\s*([A-Za-z])\s*0*([0-9]+)\s*$")  # e.g. "S1", " m 02 ", "E10"

def process_blocks(df):
    for index, row in df.iterrows():
        pos_raw = row.get("Position", None)

        # Skip empty / NaN rows (common in Excel tail)
        if pos_raw is None or (isinstance(pos_raw, float) and np.isnan(pos_raw)):
            continue

        pos_str = str(pos_raw).strip()
        m = _POS_RE.match(pos_str)
        if m:
            letter = m.group(1).upper()
            block_id = int(m.group(2))
        else:
            # Fallback: route anything non-S/M to End, try to parse trailing number
            if not pos_str:
                continue
            letter = pos_str[0].upper()
            num_part = pos_str[1:].strip()
            try:
                block_id = int(float(num_part)) if num_part else None
            except Exception:
                raise ValueError(f"Unrecognized Position format at row {index}: {pos_raw!r}")
            if block_id is None:
                continue

        block_index = 0 if letter == "S" else 1 if letter == "M" else 2
        family = ["S", "M", "E"][block_index]

        # Build filename (adjust to :02d if your files are zero-padded)
        fname = f"{family}{block_id}.svg"
        svg_path = f"assets/blocks/{config.block_set_id}/block_svg/{fname}"

        # Fail fast if the file doesn't exist (helps catch mismatches early)
        full = os.path.join(config.src_dir, svg_path.lstrip("/"))
        if not os.path.isfile(full):
            raise FileNotFoundError(
                f"Missing SVG for Position={pos_raw!r} (parsed as {family}{block_id}). "
                f"Expected file: {full}"
            )

        # Measure and record
        _, _, width, height = get_svg_dimensions(svg_path)
        data["blocks"][block_index].append(
            {
                "index": block_index,
                "id": block_id,
                "svgUrl": svg_path,
                "width": width,
                "height": height,
            }
        )

        block_ids = [0, 0, 0]
        block_ids[block_index] = block_id
        key = ":".join(str(i) for i in block_ids)

        add_lookup_entry(
            key,
            smiles=row["SMILES w/ H replacing RG"],
            chemical_formula=row["Formula"],
            molecular_weight=row["MW"],
            tpsa=row["TPSA"],
            c_log_p=row["cLogP"],
        )

def process_products(df):
    for index, row in df.iterrows():
        s_id = int(row["Start"][1:])
        m_id = int(row["Middle"][1:])
        e_id = int(row["End"][1:])
        key = f"{s_id}:{m_id}:{e_id}"

        add_lookup_entry(
            key,
            # smiles=block['SMILES w/ connection(s)'],
            smiles=row["SMILES"],
            chemical_formula=row["Formula"],
            molecular_weight=row["MW"],
            tpsa=row["TPSA"],
            c_log_p=row["cLogP"],
        )

def generate_block_set():
    df = pd.read_excel(input_filepath, sheet_name=None)

    process_blocks(df["Blocks"])
    process_products(df["Products"])
    compute_statistics(data)

    # ensure target dir exists before writing
    os.makedirs(config.workdir, exist_ok=True)
    with open(os.path.join(config.workdir, "data.json"), "w") as f:
        json.dump(data, f, indent=2)
