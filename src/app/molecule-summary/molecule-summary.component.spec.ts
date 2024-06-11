import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeSummaryComponent } from './molecule-summary.component';
import { Coordinates, Molecule } from '../models';

describe('MoleculeSummaryComponent', () => {
  let component: MoleculeSummaryComponent;
  let fixture: ComponentFixture<MoleculeSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoleculeSummaryComponent],
    });
    fixture = TestBed.createComponent(MoleculeSummaryComponent);
    component = fixture.componentInstance;
    component.molecule = new Molecule(new Coordinates(0, 0), []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
