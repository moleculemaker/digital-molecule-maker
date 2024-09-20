import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeDetailComponent } from './molecule-detail.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as colorWheelBlockSet from '../../assets/blocks/10x10x10palette/data.json';
import { BlockSet, Coordinates, Molecule } from '../models';
import {ChemicalPropertyPipe} from "../pipes/chemical-property.pipe";

describe('MoleculeDetailComponent', () => {
  let component: MoleculeDetailComponent;
  let fixture: ComponentFixture<MoleculeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [MoleculeDetailComponent, ChemicalPropertyPipe],
    });
    fixture = TestBed.createComponent(MoleculeDetailComponent);
    component = fixture.componentInstance;
    component.molecule = new Molecule(new Coordinates(0, 0), []);
    component.blockSet = colorWheelBlockSet as unknown as BlockSet;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
