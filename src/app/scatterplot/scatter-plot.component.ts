import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TrackByFunction,
} from '@angular/core';
import { lambdaMaxToColor } from '../utils/colors';
import { Block, BlockSet } from '../models';
import { getAllOutcomes } from '../lookup';
import { BlockSetId } from '../services/block.service';

type Point = {
  key: string;
  x: number;
  y: number;
  focus: boolean;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dmm-scatterplot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss'],
})
export class ScatterPlotComponent {
  @Input()
  blockList!: Block[];

  @Input()
  blockSet!: BlockSet;

  get xAxis() {
    return this.blockSet.functionalProperties[0]!;
  }

  get yAxis() {
    return this.blockSet.functionalProperties[1]!;
  }

  get isColorWheel() {
    return this.blockSet.id === BlockSetId.ColorWheel;
  }

  pointTrackBy: TrackByFunction<Point> = (index, point) => point.key;

  get allPoints(): Point[] {
    return getAllOutcomes(this.blockList, this.blockSet).map(
      ({ entry, isReachable }) => ({
        key: entry.key,
        focus: isReachable,
        x:
          ((Number(entry[this.xAxis.key]) - this.xAxis.min) /
            (this.xAxis.max - this.xAxis.min)) *
          1000,
        y:
          ((this.yAxis.max - Number(entry[this.yAxis.key])) /
            (this.yAxis.max - this.yAxis.min)) *
          1000,
      }),
    );
  }

  lambdaMaxToColor = lambdaMaxToColor;
}
