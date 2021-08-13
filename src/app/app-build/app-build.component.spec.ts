import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppBuildComponent } from './app-build.component';

describe('AppBuildComponent', () => {
  let component: AppBuildComponent;
  let fixture: ComponentFixture<AppBuildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppBuildComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppBuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
