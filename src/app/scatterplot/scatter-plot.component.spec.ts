import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterPlotComponent } from './scatter-plot.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as colorWheelBlockSet from '../../assets/blocks/10x10x10palette/data.json';
import {BlockSet} from "../models";

describe('ScatterplotComponent', () => {
  let component: ScatterPlotComponent;
  let fixture: ComponentFixture<ScatterPlotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ScatterPlotComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScatterPlotComponent);
    component = fixture.componentInstance;
    component.blockList = [];
    component.blockSet = colorWheelBlockSet as unknown as BlockSet;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
