import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockSvgComponent } from './block-svg.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as colorWheelBlockSet from '../../assets/blocks/10x10x10palette/data.json';
import { BlockSet } from '../models';

describe('BlockSvgComponent', () => {
  let component: BlockSvgComponent;
  let fixture: ComponentFixture<BlockSvgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [BlockSvgComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockSvgComponent);
    component = fixture.componentInstance;
    component.blockSet = colorWheelBlockSet as unknown as BlockSet;
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
