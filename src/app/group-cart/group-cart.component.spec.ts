import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupCartComponent } from './group-cart.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('GroupCartComponent', () => {
  let component: GroupCartComponent;
  let fixture: ComponentFixture<GroupCartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [GroupCartComponent],
    });
    fixture = TestBed.createComponent(GroupCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
