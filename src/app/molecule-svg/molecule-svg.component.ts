import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnInit, Input, TemplateRef, ViewChild, SimpleChanges, ChangeDetectorRef} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Block, BlockType, Molecule, Coordinates } from '../models';

@Component({
  selector: 'dmm-molecule-svg',
  templateUrl: './molecule-svg.component.html',
  styleUrls: ['./molecule-svg.component.scss']
})
export class MoleculeSvgComponent implements OnInit {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<any>|null = null;

  @Input()
  molecule : Molecule | undefined;

  @Input()
  closeOverlayObservable?: Observable<void>;

  isInfoPanelOpen = false;
  isEditNamePanelOpen = false;

  _eventsSubscription?: Subscription;
  positionPairs!: ConnectionPositionPair[];
  positionEditName!: ConnectionPositionPair[];

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.changeDetector.detectChanges();
    if(this.closeOverlayObservable){
        this._eventsSubscription = this.closeOverlayObservable.subscribe(() => {
            this.isInfoPanelOpen = false;
            this.isEditNamePanelOpen = false;
        });
    }

    this.positionPairs = [
        {
          offsetX: -15,
          offsetY: 20,
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
    ];

    this.positionEditName = [
        {
          offsetX: 0,
          offsetY: -22,
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top'
        },
    ];
  }

  ngOnDestroy(){
    if(this._eventsSubscription) this._eventsSubscription.unsubscribe();
  }

  onMouseEnter() {
//todo: eventually, we will try to support hover (instead of click) to show the overlay panel. note that the molecule AND individual blocks will show slightly different information (see designs). when we make this change, the overlay panel will need to have the position adjusted so the mouse can stay on the svg the entire time (or determine if we need to adjust the template completely (simple show/hide of a div instead of the cdkOverlay since it's positioned at the base of the DOM structure)
//    this.isInfoPanelOpen = true;
  }

  onMouseLeave() {
//    this.isInfoPanelOpen = false;
  }

  showEditName() {
    this.isEditNamePanelOpen = true;
  }
}

