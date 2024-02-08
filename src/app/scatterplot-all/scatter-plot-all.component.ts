import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { HSLColorOptions, lambdaMaxToColor } from '../utils/colors';

type Point = { x: number; y: number };
type Bounds = [number, number, number, number];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: '[dmm-scatterplot-all]',
  templateUrl: './scatter-plot-all.component.html',
  styleUrls: ['./scatter-plot-all.component.scss'],
})
export class ScatterPlotAllComponent implements OnInit {
  @Input('points') points!: Point[];
  @Input('bounds') bounds!: Bounds;

  constructor() {}

  lambdaMaxToColor(lambda: number, options: HSLColorOptions = {}) {
    return lambdaMaxToColor(lambda, options);
  }

  ngOnInit(): void {}
}
