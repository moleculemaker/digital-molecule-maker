import { Component, Input } from '@angular/core';
import { BlockSet, Molecule } from '../models';
import { lookupProperty } from '../lookup';

@Component({
  selector: 'dmm-molecule-summary',
  templateUrl: './molecule-summary.component.html',
  styleUrls: ['./molecule-summary.component.scss'],
})
export class MoleculeSummaryComponent {
  @Input()
  moleculeId!: number;

  @Input()
  molecule!: Molecule;

  @Input()
  blockSet!: BlockSet;

  moleculeNamePlaceholder = 'Molecule Name';

  getPredictedProperty = lookupProperty;
}
