import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeSvgComponent } from './molecule-svg.component';

describe('MoleculeSvgComponent', () => {
  let component: MoleculeSvgComponent;
  let fixture: ComponentFixture<MoleculeSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoleculeSvgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MoleculeSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
