import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InplaceComponent } from './inplace.component';

describe('InplaceComponent', () => {
  let component: InplaceComponent;
  let fixture: ComponentFixture<InplaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InplaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InplaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
