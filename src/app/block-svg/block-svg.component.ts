import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnInit, Input, TemplateRef, ViewChild, SimpleChanges} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { BlockType } from '../models';

@Component({
  selector: 'dmm-block-svg',
  templateUrl: './block-svg.component.html',
  styleUrls: ['./block-svg.component.scss']
})
export class BlockSvgComponent implements OnInit {
  @ViewChild('childComponentTemplate') childComponentTemplate: TemplateRef<any>|null = null;

  @Input()
  svgUrl = '';

  @Input()
  iconLabel = ''; //if set, then we display the entire block as a small icon

  @Input()
  type = BlockType.Start;

  @Input()
  closeOverlayObservable?: Observable<void>;

  blockWidth = 100;
  blockHeight = 100;

  padding = {
    x: 20 * 4,
    y: 20 * 1.5
  };

  strokeWidth = 4;
  strokeDasharray = "";

  borderRadius = 4;
  borderOffset = 15;

  tabOffset = 20; //px down from top
  tabHeight = 28; //px tall (middle of tab)
  tabWidth = 20; //px wide tab

  imageZoomAndPanMatrix = [1, 0, 0, 1, 60, 40 + this.borderOffset];

  path = "";

  isInfoPanelOpen = false;
  _eventsSubscription?: Subscription;

  popupoffsetX = 0;

  positionPairs!: ConnectionPositionPair[];

  constructor() {

  }

  ngOnInit(): void {
    if(this.closeOverlayObservable){
        this._eventsSubscription = this.closeOverlayObservable.subscribe(() => {
            this.isInfoPanelOpen = false;
        });
    }

    if(this.type == BlockType.Middle){
        this.popupoffsetX = -1 * (this.blockWidth + this.padding.x)
    } else if(this.type == BlockType.End){
        this.popupoffsetX = -2 * (this.blockWidth + this.padding.x)
    }

    this.positionPairs = [
        {
          offsetX: this.popupoffsetX,
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

  ngOnChanges(changes: SimpleChanges){
    if(changes.svgUrl){
      this.path = this.drawBlock();
    }
  }

  onClick(): void {
    alert(this.type);
  }

  drawBlock() {
    let path = '';
    let hasRightTab = (!this.isEnd() && !this.isAddBlock()) ? true : false;
    let minX = this.strokeWidth + this.borderOffset;
    let minY = this.strokeWidth + this.borderOffset;

    if(this.isMiddle()){
      minX += this.blockWidth + this.padding.x;
      this.imageZoomAndPanMatrix[4] = minX + 60;
    } else if(this.isEnd()){
      minX += 2 * (this.blockWidth + this.padding.x);
      this.imageZoomAndPanMatrix[4] = minX + 60;
    }

    let maxX = this.blockWidth + this.padding.x + minX;
    let maxY = this.blockHeight + this.padding.y + this.borderOffset;

    let closePath = true;

    //build list of coordinates
    let coords: Array<{x: number, y: number, radius?: number}> = [];

    //start upper left
    coords.push({x:minX, y:minY});

    //top right
    coords.push({x:maxX, y:minY});

    //right tab (override radius)
    if (hasRightTab) {
      coords.push({x:maxX, y:this.tabOffset+this.borderOffset});
      coords.push({x:maxX + this.tabWidth, y:this.tabOffset + this.tabWidth+this.borderOffset});
      coords.push({x:maxX + this.tabWidth, y:this.tabOffset + this.tabWidth + this.tabHeight+this.borderOffset});
      coords.push({x:maxX, y:this.tabOffset + this.tabWidth + this.tabHeight + this.tabWidth+this.borderOffset});
    }

    //bottom right
    coords.push({x:maxX, y:maxY});

    //bottom left
    coords.push({x:minX, y:maxY});

    // //left tab (override radius)
    if (!this.isStart() && !this.isAddBlock()) {
      coords.push({x:minX, y:this.tabOffset + this.tabWidth + this.tabHeight + this.tabWidth+this.borderOffset});
      coords.push({x:minX + this.tabWidth, y:this.tabOffset + this.tabWidth + this.tabHeight+this.borderOffset});
      coords.push({x:minX + this.tabWidth, y:this.tabOffset + this.tabWidth+this.borderOffset});
      coords.push({x:minX, y:this.tabOffset+this.borderOffset});
    }

    //generate rounded corner path
    path = this.createRoundedPath(coords, this.borderRadius, closePath);

    return path;
  }

    //********************************************
  //requires an array of {x:0, y:0} coordinate pairs
  //based on https://stackoverflow.com/questions/10177985/svg-rounded-corner/65186378#65186378
  createRoundedPath(coords: Array<{x: number, y: number, radius?: number}>, radius = 8, close = true) {
    let path = "";
    const length = coords.length + (close ? 1 : -1);

    for (let i = 0; i < length; i++) {
      const a = coords[i % coords.length];
      const b = coords[(i + 1) % coords.length];

      //added to allow override of radius at coordinate level
      let thisRadius = (a.radius && a.radius > 0) ? a.radius : radius;
      const t = Math.min(Number(thisRadius) / Math.hypot(b.x - a.x, b.y - a.y), 0.5);
//      const t = Math.min(Number(radius) / Math.hypot(b.x - a.x, b.y - a.y), 0.5);

      if (i > 0) {path += `Q${a.x},${a.y} ${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`;}

      if (!close && i == 0) {
        path += `M${a.x},${a.y}`;
      } else if (i == 0) {
        path += `M${a.x * (1 - t) + b.x * t},${a.y * (1 - t) + b.y * t}`;
      }

      if (!close && i == length - 1) {
        path += `L${b.x},${b.y}`;
      } else if (i < length - 1) {
        path += `L${a.x * t + b.x * (1 - t)},${a.y * t + b.y * (1 - t)}`;
      }
    }

    if (close) {path += "Z";}

    return path;
  }

  // Check if the block is placeholder for another block
  isAddBlock() {
    return (!this.iconLabel && !this.svgUrl) ? true : false;
  }

  // check if it's a starting block
  isStart() {
    return this.type === BlockType.Start;
  }

  // check if it's a middle block
  isMiddle() {
    return this.type === BlockType.Middle;
  }

  // check if it's an ending block
  isEnd() {
    return this.type === BlockType.End;
  }

  calculateDeletePositionX() {
    let minX = this.strokeWidth + this.borderOffset;

    if(this.isMiddle()){
      minX += this.blockWidth + this.padding.x;
    } else if(this.isEnd()){
      minX += 2 * (this.blockWidth + this.padding.x);
    }

    return ((this.blockWidth + this.padding.x) / 2) + minX;
  }

  calculateDeletePositionY() {
    return this.blockHeight + this.padding.y;
  }

  removeBlock() {
  }
}

