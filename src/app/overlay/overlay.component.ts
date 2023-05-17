import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';

import { animate, state, style, transition, trigger } from '@angular/animations';
import { Block, Molecule } from "../models";

@Component({
  selector: 'dmm-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  animations: [
    trigger('overlayPropExpand', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class OverlayComponent implements OnInit {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<any>|null = null;

  @Input()
  blockOrMolecule: Block|Molecule|null = null;

  @Input()
  properties:any[] = [];

  @Input()
  additionalProperties:any[] = [];

  @Input()
  tags:any[] = [];

  @Input()
  isExpanded = false;

  @Input()
  enableAddToCart = false;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  addToCart = new EventEmitter<void>();

  @ContentChild('templateAdditionalProperties') templateAdditionalProperties:TemplateRef<HTMLElement>|null = null;
  @ContentChild('templateFooter') templateFooter:TemplateRef<HTMLElement>|null = null;

  isOverlayPropExpanded = false;

  constructor() { }

  ngOnInit(): void {

  }

  onClose():void {
    this.close.emit();
  }

  onAddToCart(){
    this.addToCart.emit();
  }

  getMode(): 'block'|'molecule'|null {
    let returnVal: 'block'|'molecule'|null = null;
    if (this.blockOrMolecule) {
      if ('blockList' in this.blockOrMolecule) {
        returnVal = 'molecule';
      } else {
        returnVal = 'block';
      }
    }
    return returnVal;
  }
}
