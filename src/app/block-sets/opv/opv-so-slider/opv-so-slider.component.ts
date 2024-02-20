import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'dmm-opv-so-slider',
  templateUrl: './opv-so-slider.component.html',
  styleUrls: ['./opv-so-slider.component.scss'],
})
export class OpvSoSliderComponent {
  @Input() value$!: BehaviorSubject<[number, number]>;
  @Input() min!: number;
  @Input() max!: number;
}
