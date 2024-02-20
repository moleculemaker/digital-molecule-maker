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
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Molecule, MolecularPropertyDefinition } from 'app/models';
import { BlockService } from 'app/dmm/services/block.service';
import { isFull } from 'app/utils/Array';

@Component({
  selector: '[dmm-molecule-svg]',
  templateUrl: './molecule-svg.component.html',
  styleUrls: ['./molecule-svg.component.scss'],
})
export class MoleculeSvgComponent implements OnInit {
  @Input()
  molecule!: Molecule;

  @Input()
  interactive = true;

  @Input()
  closeOverlayObservable?: Observable<void>;

  @Output()
  deleteMolecule = new EventEmitter<void>();

  /**
   * Emits the index of the block to be deleted
   */
  @Output()
  deleteBlock = new EventEmitter<number>();

  @Output()
  addToCart = new EventEmitter();

  isInfoPanelOpen = false;
  isEditNamePanelOpen = false;

  _eventsSubscription?: Subscription;
  positionPairs!: ConnectionPositionPair[];
  positionEditName!: ConnectionPositionPair[];

  constructor(
    private blockService: BlockService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  get isComplete() {
    return isFull(this.molecule.blockList);
  }

  get blockSet() {
    return this.blockService.blockSet!;
  }

  ngOnInit(): void {
    this.changeDetector.detectChanges();
    if (this.closeOverlayObservable) {
      this._eventsSubscription = this.closeOverlayObservable.subscribe(() => {
        this.isInfoPanelOpen = false;
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
    console.log('mole yo');
    if (this._eventsSubscription) this._eventsSubscription.unsubscribe();
  }

  onMouseEnter() {
    //todo: eventually, we will try to support hover (instead of click) to show the overlay panel. note that the molecule AND individual blocks will show slightly different information (see designs). when we make this change, the overlay panel will need to have the position adjusted so the mouse can stay on the svg the entire time (or determine if we need to adjust the template completely (simple show/hide of a div instead of the cdkOverlay since it's positioned at the base of the DOM structure)
    //  this.isInfoPanelOpen = true;
  }

  onMouseLeave() {
    //  this.isInfoPanelOpen = false;
  }

  private mouseInside = false;
  private mouseDown = false;
  private dragging = false;

  onMouseOver(e: MouseEvent) {
    this.mouseInside = true;
  }

  onMouseOut(e: MouseEvent) {
    this.mouseInside = false;
  }

  onMouseDown() {
    this.mouseDown = true;
  }

  onMouseMove() {
    if (this.mouseDown) {
      this.dragging = true;
    }
  }

  onMouseUp() {
    if (!this.dragging) {
      if (this.mouseDown && this.mouseInside) {
        this.isInfoPanelOpen = !this.isInfoPanelOpen;
      }
    } else {
      this.dragging = false;
    }
    this.mouseDown = false;
  }

  showEditName() {
    this.isEditNamePanelOpen = true;
  }

  onEnterInput(event: Event, newMoleculeName: string) {
    const keyboardEvent = event as KeyboardEvent;
    if (keyboardEvent.key === 'Enter') {
      this.updateMoleculeLabel(newMoleculeName);
    }
  }

  updateMoleculeLabel(newMoleculeName: string) {
    this.isEditNamePanelOpen = false;
    const trimmedName = newMoleculeName.trim();
    if (trimmedName.length > 0) {
      this.molecule!.label = newMoleculeName;
    }
  }

  addMoleculeToCart() {
    this.addToCart.emit();
  }
}
