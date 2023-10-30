import * as d3 from 'd3';

const LAMBDA_RANGE_MAX = 780;
const LAMBDA_RANGE_MIN = 100;

type ColorTypeDef = {
  name: string;
  display: d3.ColorSpaceObject;
  min: number;
  max: number;
};

export const LambdaMaxRangeForColor = {
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
    name: 'UVA-absorbing',
    display: d3.color('lightgray')!,
    min: 315,
    max: 400,
  },
  uvb: {
    name: 'UVB-absorbing',
    display: d3.color('silver')!,
    min: 280,
    max: 315,
  },
  uvc: {
    name: 'UVC-absorbing',
    display: d3.hsl('gray')!,
    min: 100,
    max: 280,
  },
} as const;

export type ColorKeyT = keyof typeof LambdaMaxRangeForColor;

type HSLColorOptions = {
  saturation?: number;
  lightness?: number;
  opacity?: number;
};

const colorStops: Array<ColorTypeDef> = [
  LambdaMaxRangeForColor.uvc,
  LambdaMaxRangeForColor.uvb,
  LambdaMaxRangeForColor.uva,
  LambdaMaxRangeForColor.yellow,
  LambdaMaxRangeForColor.orange,
  LambdaMaxRangeForColor.magenta,
  LambdaMaxRangeForColor.blue,
  LambdaMaxRangeForColor.cyan,
];

export function lambdaMaxToColor(
  lambdaMax: number,
  options: HSLColorOptions = {},
) {
  let prev: ColorTypeDef | null = null;
  let next: ColorTypeDef | null = null;

  for (let def of colorStops) {
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
  const interpolator = d3.interpolateHsl(color1, color2);
  const color = d3.hsl(interpolator(t));

  const { saturation, lightness, opacity } = options;

  if (saturation) color.s = saturation;
  if (lightness) color.l = lightness;
  if (opacity) color.opacity = opacity;
  return color;
}
