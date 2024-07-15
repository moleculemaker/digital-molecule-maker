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
import { BlockSetId } from '../services/block.service';
import '3dmol/build/3Dmol-min.js';
import {WorkspaceService} from "../services/workspace.service";

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

  carouselIndex = 1;

  get hasSvgAndMol2() {
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

  constructor(private workspaceService: WorkspaceService) {}

  get svgMol2Key() {
    const blockList = this.molecule.blockList;
    if (blockList.length < 3) return '';
    const donorId = blockList.find((b) => b.index === 0)!.id;
    const bridgeId = blockList.find((b) => b.index === 1)!.id;
    const acceptorId = blockList.find((b) => b.index === 2)!.id;
    const donorKey = String.fromCharCode(64 + donorId);
    const acceptorKey = String.fromCharCode(74 + acceptorId);
    return `${donorKey}_${bridgeId}_${acceptorKey}`;
  }

  get svgUrl() {
    return `assets/blocks/10x10x10palette/svg/${this.svgMol2Key}.svg`;
  }

  get mol2Url() {
    return `assets/blocks/10x10x10palette/mol2/${this.svgMol2Key}.mol2`;
  }

  ngOnChanges() {
    if (this.hasSvgAndMol2) {
      $3Dmol.get(this.mol2Url, (data: string) => {
        if (this.viewer) {
          this.viewer.addModel(data, 'mol');
          this.viewer.setStyle({}, { stick: {} });
          this.viewer.zoomTo();
          this.viewer.render();
        }
      });
    }
  }

  get blockSet$() {
    return this.workspaceService.blockSet$;
  }

  get moleculeWidth() {
    return (
      (this.blockSet$.value?.moleculeSize ?? 0) * BLOCK_WIDTH + 2 * BORDER_WIDTH
    );
  }

  get moleculeHeight() {
    return BLOCK_HEIGHT + 2 * BORDER_WIDTH;
  }

  requestFullscreen(event: MouseEvent) {
    (event.currentTarget as Element)
      .requestFullscreen()
      .then(console.log, console.warn);
  }

  protected readonly lookupProperty = lookupProperty;
}
