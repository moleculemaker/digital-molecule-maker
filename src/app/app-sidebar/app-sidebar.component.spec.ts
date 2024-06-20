import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppSidebarComponent } from './app-sidebar.component';
import { BlockComponent } from '../block/block.component';
import { DroppableDirective } from '../drag-drop-utilities/droppable/droppable.directive';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import * as colorWheelBlockSet from '../../assets/blocks/10x10x10palette/data.json';
import { BlockSet } from '../models';
import {ChemicalPropertyPipe} from "../pipes/chemical-property.pipe";

describe('AppSidebarComponent', () => {
  let component: AppSidebarComponent;
  let fixture: ComponentFixture<AppSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowserAnimationsModule, HttpClientTestingModule],
      declarations: [AppSidebarComponent, BlockComponent, DroppableDirective, ChemicalPropertyPipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppSidebarComponent);
    component = fixture.componentInstance;
    component.blockSet = colorWheelBlockSet as unknown as BlockSet;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
