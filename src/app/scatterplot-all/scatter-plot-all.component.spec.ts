import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterPlotAllComponent } from './scatter-plot-all.component';

describe('ScatterplotAllComponent', () => {
  let component: ScatterPlotAllComponent;
  let fixture: ComponentFixture<ScatterPlotAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScatterPlotAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScatterPlotAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
