import {
  AfterViewChecked,
  Component,
  ElementRef,
  TrackByFunction,
} from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { lookupProperty } from '../lookup';
import { Block, Coordinates, Molecule } from '../models';
import { UserService } from '../services/user.service';

@Component({
  selector: 'dmm-detail-panel',
  templateUrl: './detail-panel.component.html',
  styleUrls: ['./detail-panel.component.scss'],
})
export class DetailPanelComponent implements AfterViewChecked {
  block: Block | null = null;
  molecule: Molecule | null = null;

  shouldScroll = false;

  constructor(
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private elRef: ElementRef<Element>,
  ) {
    this.workspaceService.selectedMolecule$.subscribe((molecule) => {
      if (molecule) {
        this.molecule = molecule;
      }
    });
    this.workspaceService.selectedBlock$.subscribe((block) => {
      this.block = block;
      this.shouldScroll = true;
    });
  }

  trackByBlockIndexId: TrackByFunction<Molecule> = (index, molecule) => {
    const block = molecule.blockList[0];
    return `${block?.index}:${block?.id}`;
  };

  get moleculesWithSingleBlocks(): Molecule[] {
    if (!this.molecule) return [];
    const res: Molecule[] = [];
    this.molecule.blockList.sort((a, b) => a.index - b.index);
    for (let block of this.molecule.blockList) {
      res.push(new Molecule(new Coordinates(0, 0), [block], ''));
    }
    return res;
  }

  get blockSet$() {
    return this.workspaceService.blockSet$;
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
      this.molecule.blockList.length === blockSet.moleculeSize &&
      !this.userService.isGuest()
    );
  }

  addMoleculeToMyCart() {
    this.workspaceService.clear();
    if (this.enableAddToCart) {
      this.workspaceService.addToPersonalCart(
        this.blockSet$.value!,
        this.molecule!,
      );
      this.workspaceService.selectedMolecule$.next(null);
      this.workspaceService.selectedBlock$.next(null);
    }
  }
}
