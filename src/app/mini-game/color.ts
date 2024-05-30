export function toRGB(
  lightSpectrum: (lambda: number) => number,
): [number, number, number] {
  let x = 0;
  let y = 0;
  let z = 0;
  let yn = 0;
  for (let lambda = 400; lambda < 780; ++lambda) {
    x += X(lambda) * lightSpectrum(lambda);
    y += Y(lambda) * lightSpectrum(lambda);
    z += Z(lambda) * lightSpectrum(lambda);
    yn += Y(lambda);
  }
  x /= yn;
  y /= yn;
  z /= yn;
  const r = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
  const g = -0.969266 * x + 1.8760108 * y + 0.041556 * z;
  const b = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;
  return [r * 255, g * 255, b * 255];
}

/**
 * Chris Wyman, Peter-Pike Sloan, and Peter Shirley, Simple Analytic Approximations
 * to the CIE XYZ Color Matching Functions, Journal of Computer Graphics Techniques (JCGT), vol. 2, no. 2, 1-11, 2013
 * Available online http://jcgt.org/published/0002/02/01/
 */

export function X(lambda: number): number {
  const t1 = (lambda - 442.0) * (lambda < 442.0 ? 0.0624 : 0.0374);
  const t2 = (lambda - 599.8) * (lambda < 599.8 ? 0.0264 : 0.0323);
  const t3 = (lambda - 501.1) * (lambda < 501.1 ? 0.049 : 0.0382);
  return (
    0.362 * Math.exp(-0.5 * t1 * t1) +
    1.056 * Math.exp(-0.5 * t2 * t2) -
    0.065 * Math.exp(-0.5 * t3 * t3)
  );
}

export function Y(lambda: number): number {
  const t1 = (lambda - 568.8) * (lambda < 568.8 ? 0.0213 : 0.0247);
  const t2 = (lambda - 530.9) * (lambda < 530.9 ? 0.0613 : 0.0322);
  return 0.821 * Math.exp(-0.5 * t1 * t1) + 0.286 * Math.exp(-0.5 * t2 * t2);
}

export function Z(lambda: number): number {
  const t1 = (lambda - 437.0) * (lambda < 437.0 ? 0.0845 : 0.0278);
  const t2 = (lambda - 459.0) * (lambda < 459.0 ? 0.0385 : 0.0725);
  return 1.217 * Math.exp(-0.5 * t1 * t1) + 0.681 * Math.exp(-0.5 * t2 * t2);
}
