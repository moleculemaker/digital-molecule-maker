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
  _eventsSubscription?: Subscription;
  positionPairs!: ConnectionPositionPair[];

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.changeDetector.detectChanges();
    if(this.closeOverlayObservable){
        this._eventsSubscription = this.closeOverlayObservable.subscribe(() => {
            this.isInfoPanelOpen = false;
        });
    }

    this.positionPairs = [
        {
          offsetX: 0,
          offsetY: 10,
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top'
        },
    ];
  }

  ngOnDestroy(){
    if(this._eventsSubscription) this._eventsSubscription.unsubscribe();
  }

}

