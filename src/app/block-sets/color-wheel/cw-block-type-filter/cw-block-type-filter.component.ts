import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'dmm-cw-block-type-filter',
  templateUrl: './cw-block-type-filter.component.html',
  styleUrls: ['./cw-block-type-filter.component.scss'],
})
export class CWBlockTypeFilterComponent implements OnInit {
  @Input()
  categories!: string[];

  @Input()
  value$!: BehaviorSubject<string[]>;

  get value() {
    return this.value$.value;
  }

  constructor() {}

  //********************************************
  onClick(type: string) {
    if (this.value.includes(type)) {
      this.value$.next(this.value.filter((t) => t !== type));
    } else {
      this.value$.next([...this.value, type]);
    }
  }

  reset() {
    this.value$.next(this.categories.slice());
  }

  ngOnInit(): void {}
}
