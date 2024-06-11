import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockComponent } from './block.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BlockComponent', () => {
  let component: BlockComponent;
  let fixture: ComponentFixture<BlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [BlockComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockComponent);
    component = fixture.componentInstance;
    component.block = {
      id: 0,
      index: 0,
      width: 0,
      height: 0,
      svgUrl: '',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
