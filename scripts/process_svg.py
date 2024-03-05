import os
import re
import sys
from typing import List, Tuple
from xml.dom.minidom import parse, Text, Element

import numpy as np

workdir = './src/assets/blocks/opv'


def tokenize(expression: str) -> List[str]:
    return re.findall(r"[+-]?(?:\d*\.\d+|\d+)|[A-Za-z]+", expression)


def parse_transform(node: Element) -> np.array:
    if 'transform' not in node.attributes:
        return np.identity(3)

    tokens = tokenize(node.getAttribute('transform'))
    if tokens[0] != 'matrix' or len(tokens) != 7:
        raise SyntaxError('transform matrix must have 6 components')

    a, b, c, d, tx, ty = [float(n) for n in tokens[1:]]
    return np.array([
        [a, c, tx],
        [b, d, ty],
        [0, 0, 1]
    ])


def get_arc_bbox(x1: float, y1: float, x2: float, y2: float, rx: float, ry: float, theta: float,
                 large_arc_flag: bool, sweep_flag: bool) -> List[Tuple[float, float]]:
    """
    See: https://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    """

    x1_ = (np.cos(theta) * (x1 - x2)) / 2 + (np.sin(theta) * (y1 - y2)) / 2
    y1_ = (-np.sin(theta) * (x1 - x2)) / 2 + (np.cos(theta) * (y1 - y2)) / 2

    factor = np.sqrt(
        (rx ** 2 * ry ** 2 - rx ** 2 * y1_ ** 2 - ry ** 2 * x1_ ** 2) /
        (rx ** 2 * y1_ ** 2 + ry ** 2 * x1_ ** 2)
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
                (ux * vx + uy * vy) /
                (np.sqrt(ux ** 2 + uy ** 2) * np.sqrt(vx ** 2 + vy ** 2))
            ) * sign
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
    if 'd' not in node.attributes:
        return []

    points = []
    tokens = tokenize(node.getAttribute('d'))

    while tokens:
        if tokens[0] == 'M' or tokens[0] == 'L':
            i = 1
            while not tokens[i].isalpha():
                points.append((float(tokens[i]), float(tokens[i + 1])))
                i += 2
            tokens = tokens[i:]
        elif tokens[0] == 'A':
            i = 1
            while not tokens[i].isalpha():
                rx, ry, theta, large_arc_flag, sweep_flag, x2, y2 = [float(n) for n in tokens[i: i + 7]]
                x1, y1 = points[-1]
                points += get_arc_bbox(x1, y1, x2, y2, rx, ry, theta, bool(large_arc_flag), bool(sweep_flag))
                points.append((x2, y2))
                i += 7
            tokens = tokens[i:]
        elif tokens[0] == 'Z':
            break
        else:
            raise SyntaxError(f'path command `{tokens[0]}` not supported')

    return points


def process_path(node: Element, parent_transform=np.identity(3)):
    if 'fill' in node.attributes:
        node.removeAttribute('fill')

    transform = parse_transform(node)
    points = parse_path(node)
    return [parent_transform @ transform @ (p[0], p[1], 1) for p in points]


def process_text(node: Element, parent_transform=np.identity(3)):
    if 'fill' in node.attributes:
        node.removeAttribute('fill')

    text = ''
    for child in node.childNodes:
        if isinstance(child, Text):
            text += child.wholeText

    font_size = node.getAttribute('font-size')

    if font_size.endswith('px'):
        font_size = font_size[:-2]
    font_size = float(font_size) if font_size else 100

    # estimate text dimensions using font size (TODO: this is not accurate at all)
    h = font_size * 0.8
    w = font_size * 0.5 * len(text)

    x = float(node.getAttribute('x'))
    y = float(node.getAttribute('y'))

    points = [(x, y - h), (x + w, y - h), (x + w, y), (x, y)]

    transform = parse_transform(node)

    return [parent_transform @ transform @ (p[0], p[1], 1) for p in points]


def process_group(group: Element, parent_transform=np.identity(3)):
    all_points = []

    transform = parent_transform @ parse_transform(group)

    for node in group.childNodes:
        if isinstance(node, Element):
            if node.tagName == 'g':
                all_points += process_group(node, transform)
            elif node.tagName == 'path':
                all_points += process_path(node, transform)
            elif node.tagName == 'text':
                all_points += process_text(node, transform)
            else:
                raise SyntaxError(f'tag name {node.tagName} not supported')

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
            if node.tagName == 'g':
                add_class_names(node, class_names)
            elif node.tagName == 'path':
                if 'd' in node.attributes and 'A' in node.getAttribute('d'):
                    # assume elliptical arcs are actually circles (i.e. connection points)
                    node.setAttribute('stroke-width', '18px')
                    node.setAttribute('class', class_names[0])
                    class_names.pop(0)


def process_svg(filename, class_names):
    xml = parse(filename)
    svg = xml.getElementsByTagName('svg')[0]

    add_class_names(svg, class_names)
    x, y, width, height = get_svg_bbox(svg)

    padding = 2
    x -= padding
    y -= padding
    width += 2 * padding
    height += 2 * padding

    if 'width' in svg.attributes:
        svg.removeAttribute('width')
    if 'height' in svg.attributes:
        svg.removeAttribute('height')

    svg.setAttribute('viewBox', f'0 0 {width} {height}')

    if x and y:
        g = xml.createElement('g')
        g.childNodes = svg.childNodes
        g.setAttribute('transform', f'matrix(1 0 0 1 {-x} {-y})')

        newline = xml.createTextNode('\n')
        svg.childNodes = [newline, g, newline]

    with open(filename, 'w') as out_file:
        svg.writexml(out_file)
        print(f'saved to {filename}')


if __name__ == '__main__':
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        process_svg(sys.argv[1], sys.argv[2:])
