import { Component, Input, HostListener } from '@angular/core';
import 'external-svg-loader';
import { lambdaMaxToColor } from 'app/utils/colors';
import { Observable } from 'rxjs';

@Component({
  selector: '[cw-sidebar-block-lambda-max]',
  templateUrl: './cw-sidebar-block-lambda-max.component.html',
  styleUrls: ['./cw-sidebar-block-lambda-max.component.scss'],
})
export class CWSidebarBlockLambdaMaxComponent {
  static backgroundFill(lambdaMax: number) {
    return lambdaMaxToColor(lambdaMax);
  }

  static backgroundStroke(lambdaMax: number) {
    return lambdaMaxToColor(lambdaMax).darker();
  }

  @Input('primaryProperty') lambdaMax!: number;

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

  get textColor() {
    return this.lambdaMax < 380
      ? lambdaMaxToColor(this.lambdaMax).darker()
      : 'white';
  }

  protected readonly onmousedown = onmousedown;
}
