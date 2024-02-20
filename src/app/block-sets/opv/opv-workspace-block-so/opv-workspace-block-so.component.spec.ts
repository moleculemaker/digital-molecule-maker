import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OPVWorkspaceBlockSOComponent } from './opv-workspace-block-so.component';

describe('OPVWorkspaceBlockSOComponent', () => {
  let component: OPVWorkspaceBlockSOComponent;
  let fixture: ComponentFixture<OPVWorkspaceBlockSOComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OPVWorkspaceBlockSOComponent],
    });
    fixture = TestBed.createComponent(OPVWorkspaceBlockSOComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
