import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailPanelComponent } from './detail-panel.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DetailPanelComponent', () => {
  let component: DetailPanelComponent;
  let fixture: ComponentFixture<DetailPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DetailPanelComponent],
    });
    fixture = TestBed.createComponent(DetailPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
