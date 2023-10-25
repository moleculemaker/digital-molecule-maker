import * as d3 from 'd3';

const LAMBDA_RANGE_MAX = 780;
const LAMBDA_RANGE_MIN = 100;

type ColorTypeDef = {
  name: string;
  display: d3.ColorSpaceObject;
  min: number;
  max: number;
};

export const LambdaMaxRangeForColor: Record<string, ColorTypeDef> = {
  yellow: {
    name: 'yellow',
    display: d3.color('yellow')!,
    min: 400,
    max: 480,
  },
  orange: {
    name: 'orange',
    display: d3.color('orange')!,
    min: 480,
    max: 490,
  },
  red: {
    name: 'red',
    display: d3.color('red')!,
    min: 490,
    max: 500,
  },
  magenta: {
    name: 'magenta',
    display: d3.color('magenta')!,
    min: 500,
    max: 560,
  },
  violet: {
    name: 'violet',
    display: d3.color('violet')!,
    min: 560,
    max: 580,
  },
  blue: {
    name: 'blue',
    display: d3.color('blue')!,
    min: 580,
    max: 605,
  },
  cyan: {
    name: 'cyan',
    display: d3.color('cyan')!,
    min: 605,
    max: 750,
  },
  uva: {
    name: 'TBD(uva)',
    display: d3.color('lightgray')!,
    min: 315,
    max: 400,
  },
  uvb: {
    name: 'TBD(uvb)',
    display: d3.color('silver')!,
    min: 280,
    max: 315,
  },
  uvc: {
    name: 'TBD(uvc)',
    display: d3.hsl('gray')!,
    min: 100,
    max: 280,
  },
};

type HSLColorOptions = {
  saturation?: number;
  lightness?: number;
  opacity?: number;
};

export function lambdaMaxToColor(
  lambdaMax: number,
  options: HSLColorOptions = {},
) {
  let prev: ColorTypeDef | null = null;
  let next: ColorTypeDef | null = null;
  for (let def of Object.values(LambdaMaxRangeForColor)) {
    if (
      (def.min + def.max) / 2 <= lambdaMax &&
      (!prev || def.min + def.max > prev.min + prev.max)
    ) {
      prev = def;
    }
    if (
      (def.min + def.max) / 2 >= lambdaMax &&
      (!next || def.min + def.max < next.min + next.max)
    ) {
      next = def;
    }
  }
  const color1 = prev ? prev.display : d3.hsl('gray');
  const color2 = next ? next.display : d3.hsl('gray');

  const lambda1 = prev ? (prev.min + prev.max) / 2 : LAMBDA_RANGE_MIN;
  const lambda2 = next ? (next.min + next.max) / 2 : LAMBDA_RANGE_MAX;
  const t = (lambdaMax - lambda1) / (lambda2 - lambda1);
  const interpolator = d3.interpolateHcl(color1, color2);
  const color = d3.hsl(interpolator(t));

  const { saturation, lightness, opacity } = options;

  if (saturation) color.s = saturation;
  if (lightness) color.l = lightness;
  if (opacity) color.opacity = opacity;
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
