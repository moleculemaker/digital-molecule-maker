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
  templateUrl: './scatterplot-all.component.html',
  styleUrls: ['./scatterplot-all.component.scss'],
})
export class ScatterplotAllComponent implements OnInit {
  @Input('points') points!: Point[];
  @Input('bounds') bounds!: Bounds;

  constructor() {}

  lambdaMaxToColor(lambda: number, options: HSLColorOptions = {}) {
    return lambdaMaxToColor(lambda, options);
  }

  ngOnInit(): void {}
}
