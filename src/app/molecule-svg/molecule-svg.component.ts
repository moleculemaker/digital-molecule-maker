import { ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  Component,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
  SimpleChanges,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  OnChanges,
  AfterViewChecked,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { Block, BlockSet, Molecule } from '../models';
import {
  BLOCK_HEIGHT,
  BLOCK_WIDTH,
  BORDER_WIDTH,
} from '../block-svg/block-svg.component';
import { lookupProperty } from '../lookup';
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: '[dmm-molecule-svg]',
  templateUrl: './molecule-svg.component.html',
  styleUrls: ['./molecule-svg.component.scss'],
})
export class MoleculeSvgComponent implements OnInit {
  @Input()
  interactive = true;

  @Input()
  blockSet!: BlockSet;

  @Input()
  closeOverlayObservable?: Observable<void>;

  @Output()
  deleteMolecule = new EventEmitter();

  @Output()
  deleteBlock = new EventEmitter<number>();

  isEditNamePanelOpen = false;

  _eventsSubscription?: Subscription;
  positionPairs!: ConnectionPositionPair[];
  positionEditName!: ConnectionPositionPair[];

  selected = false;
  selectedBlock: Block | null = null;

  @Input()
  molecule!: Molecule;

  constructor(
    private workspaceService: WorkspaceService,
    private changeDetector: ChangeDetectorRef,
  ) {
    combineLatest([
      this.workspaceService.selectedMolecule$,
      this.workspaceService.selectedBlock$,
    ]).subscribe(([molecule, block]) => {
      this.selected = this.molecule === molecule;
      if (this.selected) {
        this.selectedBlock = block;
      } else {
        this.selectedBlock = null;
      }
    });
  }

  get moleculeWidth() {
    return this.blockSet.moleculeSize * BLOCK_WIDTH + 2 * BORDER_WIDTH;
  }

  get moleculeHeight() {
    return BLOCK_HEIGHT + 2 * BORDER_WIDTH;
  }

  @HostListener('click', ['$event'])
  selectMolecule(event: MouseEvent) {
    event.stopPropagation();
    this.workspaceService.selectedBlock$.next(null);
    this.workspaceService.selectedMolecule$.next(this.molecule);
  }

  selectBlock(block: Block) {
    this.workspaceService.selectedMolecule$.next(this.molecule);
    this.workspaceService.selectedBlock$.next(block);
  }

  ngOnInit(): void {
    this.changeDetector.detectChanges();
    if (this.closeOverlayObservable) {
      this._eventsSubscription = this.closeOverlayObservable.subscribe(() => {
        this.isEditNamePanelOpen = false;
      });
    }

    this.positionPairs = [
      {
        offsetX: -40, //need to convert this numeric approach to a formula based on the width of the overlay
        offsetY: 5,
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      },
    ];

    this.positionEditName = [
      {
        offsetX: 0,
        offsetY: -22,
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
      },
    ];
  }

  ngOnDestroy() {
    if (this._eventsSubscription) this._eventsSubscription.unsubscribe();
  }

  onPointerEnter() {
    //todo: eventually, we will try to support hover (instead of click) to show the overlay panel. note that the molecule AND individual blocks will show slightly different information (see designs). when we make this change, the overlay panel will need to have the position adjusted so the mouse can stay on the svg the entire time (or determine if we need to adjust the template completely (simple show/hide of a div instead of the cdkOverlay since it's positioned at the base of the DOM structure)
    //  this.isInfoPanelOpen = true;
  }

  onPointerLeave() {
    //  this.isInfoPanelOpen = false;
  }

  private pointerInside = false;
  private pointerDown = false;
  private dragging = false;

  onPointerOver(e: PointerEvent) {
    this.pointerInside = true;
  }

  onPointerOut(e: PointerEvent) {
    this.pointerInside = false;
  }

  onPointerDown() {
    this.pointerDown = true;
  }

  onPointerMove() {
    if (this.pointerDown) {
      this.dragging = true;
    }
  }

  onPointerUp() {
    if (this.dragging) {
      this.dragging = false;
    }
    this.pointerDown = false;
  }

  showEditName() {
    this.isEditNamePanelOpen = true;
  }

  removeMolecule() {
    this.deleteMolecule.emit();
  }

  onRemoveBlock(index: number) {
    this.deleteBlock.emit(index);
  }

  onEnterInput(event: Event, newMoleculeName: string) {
    const keyboardEvent = event as KeyboardEvent;
    // if (keyboardEvent.key === 'Enter') {
    this.updateMoleculeLabel(newMoleculeName);
    // }
  }

  updateMoleculeLabel(newMoleculeName: string) {
    const trimmedName = newMoleculeName.trim();
    if (trimmedName.length > 0) {
      this.molecule!.label = newMoleculeName;
    }
  }
}
