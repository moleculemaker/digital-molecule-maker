import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CWColorFilterComponent } from './cw-color-filter.component';

describe('CWColorFilterComponent', () => {
  let component: CWColorFilterComponent;
  let fixture: ComponentFixture<CWColorFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CWColorFilterComponent]
    });
    fixture = TestBed.createComponent(CWColorFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
