import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OPVSidebarBlockSOComponent } from './opv-sidebar-block-so.component';

describe('OPVSidebarBlockSOComponent', () => {
  let component: OPVSidebarBlockSOComponent;
  let fixture: ComponentFixture<OPVSidebarBlockSOComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OPVSidebarBlockSOComponent],
    });
    fixture = TestBed.createComponent(OPVSidebarBlockSOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
