import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCartComponent } from './group-cart.component';

describe('GroupCartComponent', () => {
  let component: GroupCartComponent;
  let fixture: ComponentFixture<GroupCartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupCartComponent]
    });
    fixture = TestBed.createComponent(GroupCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
