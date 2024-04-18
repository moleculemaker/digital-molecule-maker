import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  ViewChild,
} from '@angular/core';
import { lookupProperty } from '../lookup';
import {
  BLOCK_HEIGHT,
  BLOCK_WIDTH,
  BORDER_WIDTH,
} from '../block-svg/block-svg.component';
import { BlockSet, Molecule } from '../models';
import { CartService } from '../services/cart.service';
import { BlockSetId } from '../services/block.service';
import '3dmol/build/3Dmol-min.js';

declare global {
  const $3Dmol: any;
}

@Component({
  selector: 'dmm-molecule-detail',
  templateUrl: './molecule-detail.component.html',
  styleUrls: ['./molecule-detail.component.scss'],
})
export class MoleculeDetailComponent implements OnChanges {
  @Input()
  molecule!: Molecule;

  @Input()
  blockSet!: BlockSet;

  carouselIndex = 0;

  get has3dmolData() {
    return (
      this.blockSet.id === BlockSetId.ColorWheel &&
      this.molecule.blockList.length === 3
    );
  }

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

  constructor(private cartService: CartService) {}

  ngOnChanges() {
    if (this.has3dmolData) {
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
          }
        },
      );
    }
  }

  get blockSet$() {
    return this.cartService.blockSet$;
  }

  get moleculeWidth() {
    return (
      (this.blockSet$.value?.moleculeSize ?? 0) * BLOCK_WIDTH + 2 * BORDER_WIDTH
    );
  }

  get moleculeHeight() {
    return BLOCK_HEIGHT + 2 * BORDER_WIDTH;
  }

  protected readonly lookupProperty = lookupProperty;
}
