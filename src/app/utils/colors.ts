import * as d3 from 'd3';

const LAMBDA_RANGE_MAX = 800;
const LAMBDA_RANGE_MIN = 300;

function clamp(v: number, min: number, max: number) {
  return Math.max(Math.min(v, max), min);
}

const interpolator = d3.piecewise(d3.interpolateHsl, [
  'white', // 300
  'white', // 325
  'white', // 350
  'yellow', // 375
  'yellow', // 400
  'yellow', // 425
  'yellow', // 450
  'orange', // 475
  'red', // 500
  'magenta', // 525
  'magenta', // 550
  'violet', // 575
  'blue', // 600
  'cyan', // 625
  'cyan', // 650
  'green', // 675
  'green', // 700
  'green', // 725
  'green', // 750
  'green', // 775
  'white', // 800
]);

type HSLColorOptions = {
  saturation?: number;
  lightness?: number;
  opacity?: number;
};

export function lambdaMaxToColor(
  lambdaMax: number,
  options: HSLColorOptions = {}
): d3.HSLColor {
  const { saturation = 1, lightness = 0.5, opacity = 1 } = options;
  const t =
    (lambdaMax - LAMBDA_RANGE_MIN) / (LAMBDA_RANGE_MAX - LAMBDA_RANGE_MIN);
  const color = d3.hsl(d3.color(interpolator(clamp(t, 0, 1)))!);
  color.s = saturation;
  color.l = lightness;
  color.opacity = opacity;
  return color;
}

export function getTextColorFromBackgroundColor(
  c: d3.ColorSpaceObject
): d3.ColorSpaceObject {
  const textColors = [
    d3.color('white')!,
    d3.color('gray')!,
    d3.color('black')!,
  ];
  let maxContrast = 0,
    k = 0;
  for (let i = 0; i < textColors.length; ++i) {
    const contrast = contrastRatio(textColors[i], c);
    if (contrast > maxContrast) {
      maxContrast = contrast;
      k = i;
    }
  }
  return textColors[k];
}

function contrastRatio(
  c1: d3.ColorSpaceObject,
  c2: d3.ColorSpaceObject
): number {
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function relativeLuminance(c: d3.ColorSpaceObject): number {
  const rgb = d3.rgb(c);
  const r = gamma(rgb.r / 255);
  const g = gamma(rgb.g / 255);
  const b = gamma(rgb.b / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function gamma(v: number): number {
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ^ 2.4;
}
