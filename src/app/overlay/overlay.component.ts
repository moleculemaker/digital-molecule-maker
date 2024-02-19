import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Block, MolecularPropertyDefinition, Molecule } from '../models';
import { BlockService } from '../services/block.service';

@Component({
  selector: 'dmm-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.scss'],
  animations: [
    trigger('overlayPropExpand', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class OverlayComponent implements OnInit {
  @Input()
  block: Block | null = null;

  @Input()
  molecule: Molecule | null = null;

  @Input()
  tags: any[] = [];

  @Input()
  isExpanded = false;

  @Input()
  enableAddToCart = false;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  addToCart = new EventEmitter<void>();

  @ContentChild('templateAdditionalProperties')
  templateAdditionalProperties: TemplateRef<{
    $implicit: OverlayComponent;
  }> | null = null;
  @ContentChild('templateFooter')
  templateFooter: TemplateRef<HTMLElement> | null = null;

  isOverlayPropExpanded = false;

  constructor(private blockService: BlockService) {}

  get blockSet() {
    return this.blockService.blockSet;
  }

  ngOnInit(): void {}

  onClose(): void {
    this.close.emit();
  }

  onAddToCart() {
    this.addToCart.emit();
  }

  getPropertyDisplayString(
    molecule: Molecule,
    property: MolecularPropertyDefinition,
  ) {
    return this.blockSet?.getMolecularPropertyDisplayString(
      molecule.blockList,
      property,
    );
  }
}
