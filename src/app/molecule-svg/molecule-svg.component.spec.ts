import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeSvgComponent } from './molecule-svg.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OverlayModule } from '@angular/cdk/overlay';

import * as colorWheelBlockSet from '../../assets/blocks/10x10x10palette/data.json';
import {BlockSet, Coordinates, Molecule} from '../models';

describe('MoleculeSvgComponent', () => {
  let component: MoleculeSvgComponent;
  let fixture: ComponentFixture<MoleculeSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, OverlayModule],
      declarations: [MoleculeSvgComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleculeSvgComponent);
    component = fixture.componentInstance;
    component.blockSet = colorWheelBlockSet as unknown as BlockSet;
    component.molecule = new Molecule(new Coordinates(0, 0), []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
