import { Component, Input } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'dmm-opv-workspace-block-so',
  templateUrl: './opv-workspace-block-so.component.html',
  styleUrls: ['./opv-workspace-block-so.component.scss'],
})
export class OPVWorkspaceBlockSOComponent {
  static backgroundFill(moleculeSO: number, blockSO: number) {
    return d3.interpolateViridis(moleculeSO % 1);
  }

  static backgroundStroke(moleculeSO: number, blockSO: number) {
    return 'black';
  }

  @Input('moleculePrimaryProperty') moleculeSO!: number;
  @Input('blockPrimaryProperty') blockSO!: number;

  @Input() minX!: number;
  @Input() maxX!: number;
  @Input() minY!: number;
  @Input() maxY!: number;

  // TODO: this is NOT actual logic
  i = Math.floor(Math.random() * 3);
  get emoji() {
    return ['🚀', '😎', '🔥'][Math.floor(this.blockSO * 100) % 3];
  }

  get centerX() {
    return (this.minX + this.maxX) / 2;
  }

  get centerY() {
    return (this.minY + this.maxY) / 2;
  }
}
