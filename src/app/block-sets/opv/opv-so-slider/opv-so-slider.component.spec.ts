import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpvSoSliderComponent } from './opv-so-slider.component';

describe('OpvSoSliderComponent', () => {
  let component: OpvSoSliderComponent;
  let fixture: ComponentFixture<OpvSoSliderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpvSoSliderComponent]
    });
    fixture = TestBed.createComponent(OpvSoSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
