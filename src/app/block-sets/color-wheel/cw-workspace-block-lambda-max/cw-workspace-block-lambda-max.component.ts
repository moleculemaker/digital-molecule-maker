import { Component, Input } from '@angular/core';
import { lambdaMaxToColor } from 'app/block-sets/color-wheel/colors';

@Component({
  selector: 'dmm-cw-workspace-block-lambda-max',
  templateUrl: './cw-workspace-block-lambda-max.component.html',
  styleUrls: ['./cw-workspace-block-lambda-max.component.scss'],
})
export class CWWorkspaceBlockLambdaMaxComponent {
  static backgroundFill(moleculeLambdaMax: number, blockLambdaMax: number) {
    return lambdaMaxToColor(moleculeLambdaMax);
  }

  static backgroundStroke(moleculeLambdaMax: number, blockLambdaMax: number) {
    return lambdaMaxToColor(moleculeLambdaMax).darker();
  }

  @Input('moleculePrimaryProperty') moleculeLambdaMax!: number;
  @Input('blockPrimaryProperty') blockLambdaMax!: number;

  @Input() minX!: number;
  @Input() maxX!: number;
  @Input() minY!: number;
  @Input() maxY!: number;

  get centerX() {
    return (this.minX + this.maxX) / 2;
  }

  get centerY() {
    return (this.minY + this.maxY) / 2;
  }

  get textColor() {
    return this.moleculeLambdaMax < 380
      ? lambdaMaxToColor(this.moleculeLambdaMax).darker()
      : 'white';
  }
}
