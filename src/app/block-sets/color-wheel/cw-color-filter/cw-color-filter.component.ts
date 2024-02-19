import { Component, Input } from '@angular/core';
import { LambdaMaxRangeForColor } from 'app/utils/colors';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'dmm-cw-color-filter',
  templateUrl: './cw-color-filter.component.html',
  styleUrls: ['./cw-color-filter.component.scss'],
})
export class CWColorFilterComponent {
  @Input('categories')
  allColors!: string[];

  get visibleColors() {
    return this.allColors.filter((c) => !c.startsWith('uv'));
  }

  get uvColors() {
    return this.allColors.filter((c) => c.startsWith('uv'));
  }

  @Input()
  value$!: BehaviorSubject<string[]>;

  private get value() {
    return this.value$.value;
  }

  labelForColor(key: string) {
    return LambdaMaxRangeForColor[key]?.name;
  }

  onClick(color: string) {
    if (this.value.length === this.allColors.length) {
      this.value$.next([color]);
    } else if (this.value.includes(color)) {
      this.value$.next(this.value.filter((c) => c !== color));
    } else {
      this.value$.next([...this.value, color]);
    }
  }

  reset() {
    this.value$.next(this.allColors.slice());
  }
}
