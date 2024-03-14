import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoleculeSummaryComponent } from './molecule-summary.component';

describe('MoleculeSummaryComponent', () => {
  let component: MoleculeSummaryComponent;
  let fixture: ComponentFixture<MoleculeSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MoleculeSummaryComponent]
    });
    fixture = TestBed.createComponent(MoleculeSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
