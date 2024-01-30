import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScatterplotAllComponent } from './scatterplot-all.component';

describe('ScatterplotAllComponent', () => {
  let component: ScatterplotAllComponent;
  let fixture: ComponentFixture<ScatterplotAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScatterplotAllComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScatterplotAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
