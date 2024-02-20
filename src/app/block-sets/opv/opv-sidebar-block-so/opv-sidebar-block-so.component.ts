import { Component, Input } from '@angular/core';
import 'external-svg-loader';
import { lambdaMaxToColor } from 'app/utils/colors';
import { Observable } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: '[opv-sidebar-block-so]',
  templateUrl: './opv-sidebar-block-so.component.html',
  styleUrls: ['./opv-sidebar-block-so.component.scss'],
})
export class OPVSidebarBlockSOComponent {
  static backgroundFill(spectralOverlap: number) {
    return d3.interpolateViridis(spectralOverlap % 1);
  }

  static backgroundStroke(spectralOverlap: number) {
    return 'black';
  }

  @Input('primaryProperty') spectralOverlap!: number;

  @Input() minX!: number;
  @Input() maxX!: number;
  @Input() minY!: number;
  @Input() maxY!: number;

  @Input() hovered$!: Observable<boolean>;

  get centerX() {
    return (this.minX + this.maxX) / 2;
  }

  get centerY() {
    return (this.minY + this.maxY) / 2;
  }
}
