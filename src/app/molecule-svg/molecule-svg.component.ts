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
import {
  aggregateProperty,
  BlockSet,
  BlockType,
  Molecule,
  Coordinates,
  BlockPropertyDefinition,
} from '../models';
import { easeInOutQuad } from '../utils';

@Component({
  selector: 'dmm-molecule-svg',
  templateUrl: './molecule-svg.component.html',
  styleUrls: ['./molecule-svg.component.scss'],
})
export class MoleculeSvgComponent
  implements OnInit, AfterViewChecked, AfterViewInit
{
  @ViewChild('childComponentTemplate')
  childComponentTemplate: TemplateRef<any> | null = null;

  @Input()
  blockSet?: BlockSet;

  @Input()
  closeOverlayObservable?: Observable<void>;

  @Output()
  deleteMolecule = new EventEmitter();

  @Output()
  addToCart = new EventEmitter();

  isInfoPanelOpen = false;
  isEditNamePanelOpen = false;

  _eventsSubscription?: Subscription;
  positionPairs!: ConnectionPositionPair[];
  positionEditName!: ConnectionPositionPair[];

  @Input()
  molecule!: Molecule;

  timer = -1;

  lambdaMax = -1;
  _lambdaMax = -1;

  ngAfterViewInit(): void {
    this.lambdaMax = this.getAggregateProperty(
      this.molecule,
      this.blockSet!.primaryProperty
    );
  }

  ngAfterViewChecked(): void {
    const oldValue = this._lambdaMax;
    const curValue = this.lambdaMax;
    const newValue = this.getAggregateProperty(
      this.molecule,
      this.blockSet!.primaryProperty
    );

    this._lambdaMax = newValue;
    if (oldValue === newValue) return;
    if (oldValue < 0) {
      this.lambdaMax = this._lambdaMax = newValue;
      return;
    }
    cancelAnimationFrame(this.timer);

    const start = Date.now();
    const duration = 200;

    const animate = () => {
      const t = Math.min(duration, Date.now() - start);
      this.lambdaMax = Math.round(
        easeInOutQuad(t, curValue, newValue - curValue, duration)
      );
      if (t < duration) {
        this.timer = requestAnimationFrame(animate);
      }
    };

    this.timer = requestAnimationFrame(animate);
  }

  constructor(private changeDetector: ChangeDetectorRef) {}

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
    if (this._eventsSubscription) this._eventsSubscription.unsubscribe();
  }

  onMouseEnter() {
    //todo: eventually, we will try to support hover (instead of click) to show the overlay panel. note that the molecule AND individual blocks will show slightly different information (see designs). when we make this change, the overlay panel will need to have the position adjusted so the mouse can stay on the svg the entire time (or determine if we need to adjust the template completely (simple show/hide of a div instead of the cdkOverlay since it's positioned at the base of the DOM structure)
    //  this.isInfoPanelOpen = true;
  }

  onMouseLeave() {
    //  this.isInfoPanelOpen = false;
  }

  showEditName() {
    this.isEditNamePanelOpen = true;
  }

  removeMolecule() {
    this.deleteMolecule.emit();
  }

  onRemoveBlock(type: BlockType) {
    if (this.molecule)
      this.molecule.blockList = this.molecule?.blockList.filter(
        (block) => block.type != type
      );
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

  getAggregateProperty(
    molecule: Molecule,
    property: BlockPropertyDefinition
  ): any {
    return aggregateProperty(molecule, property);
  }
}
