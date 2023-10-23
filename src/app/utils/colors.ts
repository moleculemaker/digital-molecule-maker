import * as d3 from 'd3';

const LAMBDA_RANGE_MAX = 780;
const LAMBDA_RANGE_MIN = 380;

export const LambdaMaxRangeForColor: Record<
  string,
  {
    min: number;
    max: number;
  }
> = {
  yellow: { min: 400, max: 480 },
  orange: { min: 480, max: 490 },
  red: { min: 490, max: 500 },
  magenta: { min: 500, max: 560 },
  violet: { min: 560, max: 580 },
  blue: { min: 580, max: 605 },
  cyan: { min: 605, max: 750 },
};

function clamp(v: number, min: number, max: number) {
  return Math.max(Math.min(v, max), min);
}

type HSLColorOptions = {
  saturation?: number;
  lightness?: number;
  opacity?: number;
};

function interpolate(a: number, b: number, t: number) {
  if (isNaN(a)) return b;
  if (isNaN(b)) return a;
  return (1 - t) * a + t * b;
}

export function lambdaMaxToColor(
  lambdaMax: number,
  options: HSLColorOptions = {},
) {
  const { saturation = 1, lightness = 0.5, opacity = 1 } = options;

  if (lambdaMax < LAMBDA_RANGE_MIN || lambdaMax > LAMBDA_RANGE_MAX) {
    const color = d3.hsl('white');
    color.s = saturation;
    (color.l = lightness), (color.opacity = opacity);
    return color;
  }

  const prev = Object.entries(LambdaMaxRangeForColor)
    .reverse()
    .find(([, { min, max }]) => (min + max) / 2 <= lambdaMax);
  const next = Object.entries(LambdaMaxRangeForColor).find(
    ([, { min, max }]) => (min + max) / 2 >= lambdaMax,
  );
  const color1 = prev ? d3.hsl(prev[0]) : d3.hsl('white');
  const color2 = next ? d3.hsl(next[0]) : d3.hsl('white');
  const lambda1 = prev ? (prev[1].min + prev[1].max) / 2 : LAMBDA_RANGE_MIN;
  const lambda2 = next ? (next[1].min + next[1].max) / 2 : LAMBDA_RANGE_MAX;
  const t =
    lambda2 > lambda1
      ? clamp((lambdaMax - lambda1) / (lambda2 - lambda1), 0, 1)
      : 1;
  const color = d3.hsl(
    interpolate(
      color1.h,
      color2.h - color1.h > 180
        ? color2.h - 360
        : color2.h - color1.h < -180
        ? color2.h + 360
        : color2.h,
      t,
    ),
    interpolate(color1.s, color2.s, t),
    interpolate(color1.l, color2.l, t),
    interpolate(color1.opacity, color2.opacity, t),
  );
  color.s = saturation;
  color.l = lightness;
  color.opacity = opacity;
  return color;
}

export function getTextColorFromBackgroundColor(
  c: d3.ColorSpaceObject,
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
  c2: d3.ColorSpaceObject,
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
