import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppBuildComponent } from './app-build.component';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';
import { BlockComponent } from '../block/block.component';

describe('AppBuildComponent', () => {
  let component: AppBuildComponent;
  let fixture: ComponentFixture<AppBuildComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      declarations: [
        AppBuildComponent,
        AppSidebarComponent,
        BlockComponent
      ]
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
