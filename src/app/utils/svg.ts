export type SVGViewBox = [number, number, number, number];

export function getSVGViewBox(svgSource: string): SVGViewBox {
  try {
    const svgDOM = new DOMParser().parseFromString(svgSource, 'text/xml');
    const svgEl = svgDOM.querySelector('svg')!;
    return svgEl
      .getAttribute('viewBox')!
      .split(/\s+/)
      .map((s) => Number(s)) as SVGViewBox;
  } catch {
    return [0, 0, 0, 0];
  }
}
