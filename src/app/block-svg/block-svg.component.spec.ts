import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockSvgComponent } from './block-svg.component';

describe('BlockSvgComponent', () => {
  let component: BlockSvgComponent;
  let fixture: ComponentFixture<BlockSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlockSvgComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockSvgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
