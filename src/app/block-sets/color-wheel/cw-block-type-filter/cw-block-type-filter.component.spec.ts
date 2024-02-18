import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CWBlockTypeFilterComponent } from './cw-block-type-filter.component';

describe('CWBlockTypeFilterComponent', () => {
  let component: CWBlockTypeFilterComponent;
  let fixture: ComponentFixture<CWBlockTypeFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CWBlockTypeFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CWBlockTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
