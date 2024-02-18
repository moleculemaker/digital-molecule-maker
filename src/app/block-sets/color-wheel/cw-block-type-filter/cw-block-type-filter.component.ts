import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'dmm-cw-block-type-filter',
  templateUrl: './cw-block-type-filter.component.html',
  styleUrls: ['./cw-block-type-filter.component.scss'],
})
export class CWBlockTypeFilterComponent {
  @Input('categories')
  blockTypes!: string[];

  @Input()
  value$!: BehaviorSubject<string[]>;

  private get value() {
    return this.value$.value;
  }

  onClick(type: string) {
    if (this.value.length === this.blockTypes.length) {
      this.value$.next([type]);
    } else if (this.value.includes(type)) {
      this.value$.next(this.value.filter((t) => t !== type));
    } else {
      this.value$.next([...this.value, type]);
    }
  }

  reset() {
    this.value$.next(this.blockTypes.slice());
  }
}
