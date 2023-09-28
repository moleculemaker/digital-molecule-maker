export const easeInOutQuad = (t: number, b: number, c: number, d: number) =>
  (t /= d * 0.5) < 1
    ? c * 0.5 * t * t + b
    : -c * 0.5 * ((t - 1) * (t - 3) - 1) + b;

function x(lambda: number) {
  const t1 = (lambda - 442.0) * (lambda < 442.0 ? 0.0624 : 0.0374);
  const t2 = (lambda - 599.8) * (lambda < 599.8 ? 0.0264 : 0.0323);
  const t3 = (lambda - 501.1) * (lambda < 501.1 ? 0.049 : 0.0382);
  return 0.362 * Math.exp(-0.5 * t1 * t1) + 1.056 * Math.exp(-0.5 * t2 * t2);
}
function y(lambda: number) {
  const t1 = (lambda - 568.8) * (lambda < 568.8 ? 0.0213 : 0.0247);
  const t2 = (lambda - 530.9) * (lambda < 530.9 ? 0.0613 : 0.0322);
  return 0.821 * Math.exp(-0.5 * t1 * t1) + 0.286 * Math.exp(-0.5 * t2 * t2);
}
function z(lambda: number) {
  const t1 = (lambda - 437.0) * (lambda < 437.0 ? 0.0845 : 0.0278);
  const t2 = (lambda - 459.0) * (lambda < 459.0 ? 0.0385 : 0.0725);
  return 1.217 * Math.exp(-0.5 * t1 * t1) + 0.681 * Math.exp(-0.5 * t2 * t2);
}

function absorption(wave: number, lambdaMax: number) {
  const sigma = 70;
  return Math.exp(-((wave - lambdaMax) ** 2) / sigma ** 2);
}

export function getRgbFromLambdaMax(lambdaMax: number) {
  let X = 0;
  let Y = 0;
  let Z = 0;
  let X_MAX = 0;
  let Y_MAX = 0;
  let Z_MAX = 0;
  for (let lambda = 400; lambda < 780; ++lambda) {
    X += x(lambda) * (1 - absorption(lambda, lambdaMax));
    Y += y(lambda) * (1 - absorption(lambda, lambdaMax));
    Z += z(lambda) * (1 - absorption(lambda, lambdaMax));
    X_MAX += x(lambda);
    Y_MAX += y(lambda);
    Z_MAX += z(lambda);
  }

  X /= Y_MAX;
  Y /= Y_MAX;
  Z /= Y_MAX;

  let r = 3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
  let g = -0.969266 * X + 1.8760108 * Y + 0.041556 * Z;
  let b = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;
  r = Math.floor(r * 255);
  g = Math.floor(g * 255);
  b = Math.floor(b * 255);

  return { r, g, b };
}
