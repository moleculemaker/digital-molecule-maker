export type SVGViewBox = [number, number, number, number];

/**
 * This function assumes the SVG is valid.
 */
export function getSVGViewBox(svgSource: string): SVGViewBox {
  const svgDOM = new DOMParser().parseFromString(svgSource, 'text/xml');
  const svgEl = svgDOM.querySelector('svg')!;
  return svgEl
    .getAttribute('viewBox')!
    .split(/\s+/)
    .map((s) => Number(s)) as SVGViewBox;
}
