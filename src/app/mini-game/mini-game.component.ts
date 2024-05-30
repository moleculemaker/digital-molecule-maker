import { Component } from '@angular/core';
import { L, M, S, toRGB } from './color';

@Component({
  selector: 'dmm-mini-game',
  templateUrl: './mini-game.component.html',
  styleUrls: ['./mini-game.component.scss'],
})
export class MiniGameComponent {
  readonly minWavelength = 300;
  readonly maxWavelength = 800;

  lambda = 500;
  maxAbsorption = 0.75;
  standardDeviation = 20;

  rainbow: string[] = [];
  LPath: string;
  MPath: string;
  SPath: string;

  constructor() {
    const sigma = 50;
    for (let l = this.minWavelength; l <= this.maxWavelength; ++l) {
      const [r, g, b] = toRGB((lambda) =>
        Math.exp((-0.5 * (lambda - l) ** 2) / sigma ** 2),
      );
      this.rainbow.push(`rgb(${r},${g},${b})`);
    }
    const lambdaRange: number[] = [];
    for (let l = this.minWavelength; l <= this.maxWavelength; ++l) {
      lambdaRange.push(l);
    }
    const toPath = (f: (lambda: number) => number) => {
      return (
        'M0,200' +
        lambdaRange.map(
          (l, i) => `L${i},${(200 * (1 - 0.5 * f(l))).toFixed(4)}`,
        )
      );
    };
    this.LPath = toPath(L);
    this.MPath = toPath(M);
    this.SPath = toPath(S);
  }

  private _dirty = true;
  private _timer = -1;
  private _absorbed: number[] = [];

  get absorptionSpectrumPath(): string {
    if (this._dirty) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this._absorbed.length = 0;
        for (let l = this.minWavelength; l <= this.maxWavelength; ++l) {
          this._absorbed.push(this.getAbsorptionAt(l));
        }
      });
    }
    return (
      'M0,200' +
      this._absorbed
        .map((percentage, i) => `L${i},${(1 - percentage) * 200}`)
        .join('') +
      'L500,200'
    );
  }

  private getAbsorptionAt(lambda: number): number {
    return (
      this.maxAbsorption *
      Math.exp(
        (-0.5 * (lambda - this.lambda) ** 2) / this.standardDeviation ** 2,
      )
    );
  }

  get absorbedColor(): string {
    const [r, g, b] = toRGB((l: number) => {
      return this.getAbsorptionAt(l);
    });
    return `rgb(${r},${g},${b})`;
  }

  get perceivedColor(): string {
    const [r, g, b] = toRGB((l: number) => {
      return 1 - this.getAbsorptionAt(l);
    });
    return `rgb(${r},${g},${b})`;
  }
}
