import { AfterViewChecked, Component, ElementRef } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { CartService } from '../services/cart.service';
import { lookupProperty } from '../lookup';
import { Block, Coordinates, Molecule } from '../models';

@Component({
  selector: 'dmm-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.scss'],
})
export class DetailPanelComponent implements AfterViewChecked {
  block: Block | null = null;
  molecule: Molecule | null = null;
  moleculesWithSingleBlocks: Molecule[] = [];

  shouldScroll = false;

  constructor(
    private workspaceService: WorkspaceService,
    private cartService: CartService,
    private elRef: ElementRef<Element>,
  ) {
    this.workspaceService.selectedMolecule$.subscribe((molecule) => {
      if (molecule) {
        this.molecule = molecule;
        this.moleculesWithSingleBlocks = [];
        molecule.blockList.sort((a, b) => a.index - b.index);
        for (let block of molecule.blockList) {
          this.moleculesWithSingleBlocks.push(
            new Molecule(new Coordinates(0, 0), [block], ''),
          );
        }
      }
    });
    this.workspaceService.selectedBlock$.subscribe((block) => {
      this.block = block;
      this.shouldScroll = true;
    });
  }

  get blockSet$() {
    return this.cartService.blockSet$;
  }

  protected readonly lookupProperty = lookupProperty;

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.shouldScroll = false;
      queueMicrotask(() => {
        this.elRef.nativeElement
          .querySelector(
            this.block
              ? `#block-detail-${this.block.index}`
              : '#molecule-detail',
          )
          ?.scrollIntoView();
      });
    }
  }

  get enableAddToCart() {
    const blockSet = this.blockSet$.value;
    return (
      blockSet &&
      this.molecule &&
      this.molecule.blockList.length === blockSet.moleculeSize
    );
  }

  addMoleculeToMyCart() {
    this.workspaceService.updateMoleculeList(
      this.workspaceService.moleculeList$.value.filter(
        (m) => m !== this.molecule,
      ),
    );
    if (this.enableAddToCart) {
      this.cartService.addToPersonalCart(this.blockSet$.value!, this.molecule!);
      this.workspaceService.selectedMolecule$.next(null);
      this.workspaceService.selectedBlock$.next(null);
    }
  }
}
