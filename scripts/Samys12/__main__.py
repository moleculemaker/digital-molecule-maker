import generate
#from chem437.\\generate import generate_block_set

from generate import generate_block_set
#from config import config
from enum import Enum
from os import path


# top of __main__.py (or your config module)
from pathlib import Path
from enum import Enum

from pathlib import Path
from enum import Enum

class BlockSet(Enum):
    ColorWheel = "ColorWheel_20230504"
    OPV = "OPV_20230504"
    Chem437 = "Chem_437"
    Samys12 = "Samys12"

class Config:
    block_set = BlockSet.Samys12

    PROJECT_ROOT = Path(__file__).resolve().parents[2]   # .../digital-molecule-maker-develop
    SRC_DIR = PROJECT_ROOT / "src"                       # .../digital-molecule-maker-develop/src

    @property
    def block_set_id(self):
        return self.block_set.value

    @property
    def src_dir(self) -> str:
        return str(self.SRC_DIR)

    @property
    def workdir(self) -> str:
        # .../src/assets/blocks/<BlockSet>
        return str(self.SRC_DIR / "assets" / "blocks" / self.block_set.value)

config = Config()
# from utils.json import rename_block_svg_urls
import json
import os

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
# from utils.mol import generate_all_assets
import glob
import json
import os

from rdkit.Chem import CombineMols, MolFromSmiles
from openbabel import openbabel
from tqdm import tqdm

#from config import config
from enum import Enum
from os import path


def naive_combine(all_smiles):
    mol = MolFromSmiles("")
    for smiles in all_smiles:
        mol = CombineMols(mol, MolFromSmiles(smiles))
    return mol


def generate_assets(key, smiles):
    if "0" in key.split("_"):  # the combination is not complete
        return

    ob_conv = openbabel.OBConversion()
    ob_conv.SetInFormat("smi")

    mol = openbabel.OBMol()
    ob_conv.ReadString(mol, smiles)
    mol.AddHydrogens()
    openbabel.OBBuilder().Build(mol)

    ob_conv.SetOutFormat("mol2")
    mol2 = ob_conv.WriteString(mol)

    ob_conv.SetOutFormat("svg")
    svg = ob_conv.WriteString(mol)

    with open(os.path.join(config.workdir, "svg", f"{key}.svg"), "w") as f:
        f.write(svg)

    with open(os.path.join(config.workdir, "mol2", f"{key}.mol2"), "w") as f:
        f.write(mol2)


def generate_all_assets():
    with open(os.path.join(config.workdir, "data.json")) as f:
        data = json.load(f)
    for subdir in ["svg", "mol2"]:
        os.makedirs(os.path.join(config.workdir, subdir), exist_ok=True)
        for filepath in glob.glob(os.path.join(config.workdir, subdir, "*")):
            os.remove(filepath)
    for entry in tqdm(data["table"].values()):
        if "smiles" in entry:
            key = entry["key"].replace(":", "_")
            smiles = entry["smiles"]
            generate_assets(key, smiles)

# from utils.svg import process_block_svgs
"""
WARNING: This script is not idempotent! Please don't run it twice
"""

import glob
import os
import re
from typing import List, Tuple
from xml.dom.minidom import parse, Text, Element

import numpy as np

#from config import config

def process_path(node: Element, parent_transform=np.identity(3)):
    if "fill" in node.attributes:
        node.removeAttribute("fill")

    transform = parse_transform(node)
    points = parse_path(node)
    return [parent_transform @ transform @ (p[0], p[1], 1) for p in points]


from pathlib import Path

from pathlib import Path
from xml.dom.minidom import parse

def get_svg_dimensions(url: str):
    svg_path = (Path(config.src_dir) / url.lstrip("/")).resolve()
    if not svg_path.is_file():
        raise FileNotFoundError(
            f"SVG not found\n  src_dir={config.src_dir}\n  url={url}\n  resolved={svg_path}"
        )
    dom = parse(str(svg_path))
    svg_el = dom.getElementsByTagName("svg")[0]
    return [np.ceil(float(v)) for v in svg_el.getAttribute("viewBox").split(" ")]


def tokenize(d: str) -> List[str]:
    """
    Split an SVG path 'd' string into single-letter commands and numeric params.
    Handles commas, no-space command concatenation (e.g., 'zM'), and exponents.
    """
    d = d.replace(",", " ")  # commas are just separators
    pattern = r"[AaCcHhLlMmQqSsTtVvZz]|[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?"
    return re.findall(pattern, d)


def parse_transform(node: Element) -> np.array:
    """
    Parses SVG transform strings like:
      - matrix(a b c d e f)
      - translate(tx [ty])
      - scale(sx [sy])
      - rotate(angle [cx cy])
      - skewX(angle)
      - skewY(angle)
    and supports chaining: e.g., "translate(10,5) scale(2) rotate(45, 100, 100)".
    Returns a 3x3 affine matrix.
    """
    s = node.getAttribute("transform")
    if not s:
        return np.identity(3)

    import re
    def to_floats(argstr: str):
        # split by commas and/or whitespace; ignore empty chunks
        parts = re.split(r"[,\s]+", argstr.strip())
        return [float(p) for p in parts if p]

    def mat(a, b, c, d, e, f):
        # SVG matrix -> 3x3
        return np.array([[a, c, e],
                         [b, d, f],
                         [0, 0, 1]], dtype=float)

    def translate(tx, ty=0.0):
        return np.array([[1, 0, tx],
                         [0, 1, ty],
                         [0, 0, 1]], dtype=float)

    def scale(sx, sy=None):
        if sy is None:
            sy = sx
        return np.array([[sx, 0,  0],
                         [0,  sy, 0],
                         [0,  0,  1]], dtype=float)

    def rotate(angle_deg, cx=None, cy=None):
        theta = np.deg2rad(angle_deg)
        cos_t, sin_t = np.cos(theta), np.sin(theta)
        R = np.array([[cos_t, -sin_t, 0],
                      [sin_t,  cos_t, 0],
                      [0,      0,     1]], dtype=float)
        if cx is None or cy is None:
            return R
        # about a point: T(cx,cy) * R * T(-cx,-cy)
        T1 = translate(cx, cy)
        T2 = translate(-cx, -cy)
        return T1 @ R @ T2

    def skewX(angle_deg):
        t = np.tan(np.deg2rad(angle_deg))
        return np.array([[1, t, 0],
                         [0, 1, 0],
                         [0, 0, 1]], dtype=float)

    def skewY(angle_deg):
        t = np.tan(np.deg2rad(angle_deg))
        return np.array([[1, 0, 0],
                         [t, 1, 0],
                         [0, 0, 1]], dtype=float)

    # Find all function calls in order
    # e.g., [("translate", "10 5"), ("scale", "2"), ...]
    funcs = list(re.finditer(r"([a-zA-Z]+)\s*\(([^)]*)\)", s))
    M = np.identity(3)

    for m in funcs:
        name = m.group(1)
        args = to_floats(m.group(2))

        if name == "matrix":
            if len(args) != 6:
                raise SyntaxError("transform matrix must have 6 components")
            A = mat(*args)
        elif name == "translate":
            if len(args) == 1:
                A = translate(args[0])
            elif len(args) >= 2:
                A = translate(args[0], args[1])
            else:
                A = np.identity(3)
        elif name == "scale":
            if len(args) == 1:
                A = scale(args[0])
            elif len(args) >= 2:
                A = scale(args[0], args[1])
            else:
                A = np.identity(3)
        elif name == "rotate":
            if len(args) == 1:
                A = rotate(args[0])
            elif len(args) >= 3:
                A = rotate(args[0], args[1], args[2])
            else:
                A = np.identity(3)
        elif name == "skewX":
            if len(args) >= 1:
                A = skewX(args[0])
            else:
                A = np.identity(3)
        elif name == "skewY":
            if len(args) >= 1:
                A = skewY(args[0])
            else:
                A = np.identity(3)
        else:
            # Unknown transform type: ignore rather than fail hard
            A = np.identity(3)

        # Compose in document order
        M = M @ A

    return M

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
    tokens = tokenize(node.getAttribute("d"))
    points: List[Tuple[float, float]] = []
    i = 0
    cx = cy = 0.0  # current point

    while i < len(tokens):
        cmd = tokens[i]; i += 1

        if cmd in ("M", "m"):
            is_rel = (cmd == "m")
            while i + 1 < len(tokens) and not tokens[i].isalpha():
                x = float(tokens[i]); y = float(tokens[i+1]); i += 2
                if is_rel: x += cx; y += cy
                cx, cy = x, y
                points.append((x, y))

        elif cmd in ("L", "l"):
            is_rel = (cmd == "l")
            while i + 1 < len(tokens) and not tokens[i].isalpha():
                x = float(tokens[i]); y = float(tokens[i+1]); i += 2
                if is_rel: x += cx; y += cy
                cx, cy = x, y
                points.append((x, y))

        elif cmd in ("H", "h"):
            is_rel = (cmd == "h")
            while i < len(tokens) and not tokens[i].isalpha():
                x = float(tokens[i]); i += 1
                if is_rel: x += cx
                cx = x
                points.append((cx, cy))

        elif cmd in ("V", "v"):
            is_rel = (cmd == "v")
            while i < len(tokens) and not tokens[i].isalpha():
                y = float(tokens[i]); i += 1
                if is_rel: y += cy
                cy = y
                points.append((cx, cy))

        elif cmd in ("A", "a"):
            is_rel = (cmd == "a")
            while i + 6 < len(tokens) and not tokens[i].isalpha():
                rx = float(tokens[i]); ry = float(tokens[i+1]); theta = float(tokens[i+2])
                laf = float(tokens[i+3]); sf = float(tokens[i+4]); x2 = float(tokens[i+5]); y2 = float(tokens[i+6])
                i += 7
                x1, y1 = cx, cy
                if is_rel: x2 += cx; y2 += cy
                points += get_arc_bbox(x1, y1, x2, y2, rx, ry, theta, bool(laf), bool(sf))
                points.append((x2, y2))
                cx, cy = x2, y2

        elif cmd in ("Z", "z"):
            break
        else:
            raise SyntaxError(f"path command `{cmd}` not supported")

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

    IGNORE_TAGS = {
        "defs","title","desc","metadata","style",
        "clipPath","mask","pattern","linearGradient","radialGradient",
        "sodipodi:namedview"
    }

    for node in group.childNodes:
        if isinstance(node, Element):
            if node.tagName == "g":
                all_points += process_group(node, transform)
            elif node.tagName == "path":
                all_points += process_path(node, transform)
            elif node.tagName == "text":
                all_points += process_text(node, transform)
            elif node.tagName == "circle":
                # include circle’s bbox so viewBox math works
                cx = float(node.getAttribute("cx") or 0)
                cy = float(node.getAttribute("cy") or 0)
                r  = float(node.getAttribute("r") or 0)
                pts = [(cx-r, cy-r), (cx+r, cy-r), (cx+r, cy+r), (cx-r, cy+r)]
                M = transform @ parse_transform(node)
                all_points += [M @ (x, y, 1) for (x, y) in pts]
            elif node.tagName in IGNORE_TAGS:
                continue
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
    # choose your colors here:
    COLOR = {
        "connection_in":  "#ffff00",  # yellow
        "connection_out": "#800080",  # purple (pick any hex you like)
    }

    for node in group.childNodes:
        if isinstance(node, Element):
            if node.tagName == "g":
                add_class_names(node, class_names)
            elif node.tagName == "path":
                # your current heuristic: arc paths mark connection points
                if "d" in node.attributes and "A" in node.getAttribute("d") and class_names:
                    cls = class_names[0]
                    node.setAttribute("stroke-width", "18px")
                    node.setAttribute("class", cls)
                    # put the color back explicitly, since earlier code removes fill
                    node.setAttribute("fill", COLOR.get(cls, "#000000"))
                    # optionally keep a stroke (comment out if you don't want it)
                    # node.setAttribute("stroke", "#000000")
                    class_names.pop(0)
            elif node.tagName == "circle" and class_names:
                cls = class_names[0]
                node.setAttribute("stroke-width", "18px")
                node.setAttribute("class", cls)
                node.setAttribute("fill", COLOR.get(cls, "#000000"))
                # node.setAttribute("stroke", "#000000")  # optional
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


from pathlib import Path

def process_block_svgs():
    block_svg_dir = Path(config.workdir) / "block_svg"
    for filepath in block_svg_dir.glob("*.svg"):
        process_svg(str(filepath), ["connection_in", "connection_out"])


config.block_set = BlockSet.Samys12

print("Renaming block SVG URLs...")
rename_block_svg_urls()

print("Processing block SVGs...")
process_block_svgs()

print("Generating block set...")
generate_block_set()

print("Generating assets...")
generate_all_assets()
