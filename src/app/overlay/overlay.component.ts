import {
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
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
import { Block, BlockSet, Molecule } from '../models';
import { lookupProperty } from '../lookup';
import { BlockSetId } from '../services/block.service';
import '3dmol/build/3Dmol-min.js';

declare global {
  const $3Dmol: any;
}

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
export class OverlayComponent implements OnChanges, OnDestroy {
  @Input()
  block: Block | null = null;

  @Input()
  molecule: Molecule | null = null;

  @Input()
  blockSet!: BlockSet;

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

  viewer: any;

  @ViewChild('3dmol') set $3dmolEl(elRef: ElementRef<HTMLDivElement> | null) {
    if (elRef) {
      if (!this.viewer) {
        this.viewer = $3Dmol.createViewer(elRef.nativeElement);
      }
    } else {
      this.viewer?.stopAnimate();
      this.viewer = null;
    }
  }

  isOverlayPropExpanded = false;

  constructor() {}

  ngOnDestroy() {
    this.viewer?.stopAnimate();
    this.viewer = null;
  }

  ngOnChanges() {
    if (
      this.blockSet.id === BlockSetId.ColorWheel &&
      this.molecule &&
      this.molecule.blockList.length === 3
    ) {
      const blockList = this.molecule.blockList;
      const donorId = blockList.find((b) => b.index === 0)!.id;
      const bridgeId = blockList.find((b) => b.index === 1)!.id;
      const acceptorId = blockList.find((b) => b.index === 2)!.id;
      const donorKey = String.fromCharCode(64 + donorId);
      const acceptorKey = String.fromCharCode(74 + acceptorId);
      $3Dmol.get(
        `assets/blocks/10x10x10palette/mol2/${donorKey}_${bridgeId}_${acceptorKey}.mol2`,
        (data: string) => {
          if (this.viewer) {
            this.viewer.addModel(data, 'mol');
            this.viewer.setStyle({}, { stick: {} });
            this.viewer.zoomTo();
            this.viewer.render();
            // this.viewer.zoom(0.8, 2000);
          }
        },
      );
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onAddToCart() {
    this.addToCart.emit();
  }

  get blockType() {
    return this.block!.index === 0
      ? 'start'
      : this.block!.index === this.blockSet.moleculeSize - 1
      ? 'end'
      : 'middle';
  }

  lookupProperty = lookupProperty;
}
