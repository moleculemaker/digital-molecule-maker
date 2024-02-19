import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CWWorkspaceBlockLambdaMaxComponent } from './cw-workspace-block-lambda-max.component';

describe('CWWorkspaceBlockLambdaMaxComponent', () => {
  let component: CWWorkspaceBlockLambdaMaxComponent;
  let fixture: ComponentFixture<CWWorkspaceBlockLambdaMaxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CWWorkspaceBlockLambdaMaxComponent]
    });
    fixture = TestBed.createComponent(CWWorkspaceBlockLambdaMaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
