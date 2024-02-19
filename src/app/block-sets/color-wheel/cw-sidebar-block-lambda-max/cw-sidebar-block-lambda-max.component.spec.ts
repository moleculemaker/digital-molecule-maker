import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CWSidebarBlockLambdaMaxComponent } from './cw-sidebar-block-lambda-max.component';

describe('CWSidebarBlockLambdaMaxComponent', () => {
  let component: CWSidebarBlockLambdaMaxComponent;
  let fixture: ComponentFixture<CWSidebarBlockLambdaMaxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CWSidebarBlockLambdaMaxComponent]
    });
    fixture = TestBed.createComponent(CWSidebarBlockLambdaMaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
