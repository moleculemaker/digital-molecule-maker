import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsComponent } from './groups.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('GroupsComponent', () => {
  let component: GroupsComponent;
  let fixture: ComponentFixture<GroupsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [GroupsComponent]
    });
    fixture = TestBed.createComponent(GroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
