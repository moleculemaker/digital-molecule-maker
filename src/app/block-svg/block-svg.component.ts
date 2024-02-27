import { CdkOverlayOrigin, ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  Input,
  TemplateRef,
  ViewChild,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Block, BlockSet } from '../models';
import { lambdaMaxToColor } from '../utils/colors';
import { WorkspaceService } from '../services/workspace.service';

const BLOCK_CONTENT_WIDTH = 100;
const BLOCK_CONTENT_HEIGHT = 100;
const PADDING_X = 20 * 4;
const PADDING_Y = 20 * 1.5;
const BORDER_RADIUS = 4;
const BORDER_WIDTH = 15;
const TAB_OFFSET = 20; //px down from top
const TAB_HEIGHT = 28; //px tall (middle of tab)
const TAB_WIDTH = 20; //px wide tab

const BLOCK_WIDTH = BLOCK_CONTENT_WIDTH + PADDING_X;
const BLOCK_HEIGHT = BLOCK_CONTENT_HEIGHT + PADDING_Y;

// `molecule-svg` requires these values for layout
export { BLOCK_WIDTH, BLOCK_HEIGHT, BORDER_WIDTH };

@Component({
  selector: '[dmm-block-svg]',
  templateUrl: './block-svg.component.html',
  styleUrls: ['./block-svg.component.scss'],
})
export class BlockSvgComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  lambdaMax: number = 0;

  @Input()
  block!: Block;

  @Input()
  blockSet!: BlockSet;

  @Input()
  closeOverlayObservable?: Observable<void>;

  @Output()
  deleteBlock = new EventEmitter<number>();

  strokeDasharray = '';
  strokeWidth = 5;

  isInfoPanelOpen = false;
  _eventsSubscription?: Subscription;

  positionPairs!: ConnectionPositionPair[];

  functionModeEnabled = false;

  // layout properties
  transformMatrix = [1, 0, 0, 1, 0, 0];

  scale = 1;
  minX = 0;
  maxX = 0;
  minY = 0;
  maxY = 0;
  centerX = 0;
  centerY = 0;
  imageWidth = 0;
  imageHeight = 0;
  imageOriginX = 0;
  imageOriginY = 0;
  deleteButtonPositionX = 0;
  deleteButtonPositionY = 0;

  path = '';

  constructor(public workspaceService: WorkspaceService) {
    workspaceService.functionMode$.subscribe((enabled) => {
      this.functionModeEnabled = enabled;
    });
  }

  get blockType() {
    return this.isStart() ? 'start' : this.isEnd() ? 'end' : 'middle';
  }

  ngOnInit(): void {
    if (this.closeOverlayObservable) {
      this._eventsSubscription = this.closeOverlayObservable.subscribe(() => {
        this.isInfoPanelOpen = false;
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

    this.minX = BORDER_WIDTH + BLOCK_WIDTH * this.block.index;
    this.maxX = this.minX + BLOCK_WIDTH;
    this.centerX = (this.minX + this.maxX) / 2;

    this.minY = BORDER_WIDTH;
    this.maxY = BORDER_WIDTH + BLOCK_HEIGHT;
    this.centerY = (this.minY + this.maxY) / 2;

    this.deleteButtonPositionX = this.centerX;
    this.deleteButtonPositionY = BLOCK_HEIGHT + 14;

    this.scale = Math.min(
      BLOCK_CONTENT_HEIGHT / this.block.height,
      BLOCK_CONTENT_WIDTH / this.block.width,
    );

    this.imageWidth = this.block.width * this.scale;
    this.imageHeight = this.block.height * this.scale;

    this.imageOriginX = this.minX + (BLOCK_WIDTH - this.imageWidth) / 2;
    this.imageOriginY = this.minY + (BLOCK_HEIGHT - this.imageHeight) / 2;

    this.transformMatrix = [
      this.scale,
      0,
      0,
      this.scale,
      this.imageOriginX,
      this.imageOriginY,
    ];

    this.path = this.drawBlock();
  }

  ngOnDestroy() {
    if (this._eventsSubscription) this._eventsSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.block) {
      this.path = this.drawBlock();
    }
  }

  private mouseDown = false;
  private dragging = false;

  onMouseOver(e: MouseEvent) {
    e.stopPropagation();
  }

  onMouseOut(e: MouseEvent) {
    e.stopPropagation();
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
      if (this.mouseDown) {
        this.isInfoPanelOpen = !this.isInfoPanelOpen;
      }
    } else {
      this.dragging = false;
    }
    this.mouseDown = false;
  }

  get textColor() {
    return this.lambdaMax < 380 ? this.fillColor.darker() : 'white';
  }

  get fillColor() {
    return lambdaMaxToColor(this.lambdaMax);
  }

  get strokeColor() {
    return this.fillColor.darker();
  }

  private drawBlock() {
    let path = '';
    let hasRightTab = !this.isEnd() && !this.isAddBlock();
    const { minX, maxX, minY, maxY } = this;

    let closePath = true;

    //build list of coordinates
    let coords: Array<{ x: number; y: number; radius?: number }> = [];

    //start upper left
    coords.push({ x: minX, y: minY });

    //top right
    coords.push({ x: maxX, y: minY });

    //right tab (override radius)
    if (hasRightTab) {
      coords.push({ x: maxX, y: TAB_OFFSET + BORDER_WIDTH });
      coords.push({
        x: maxX + TAB_WIDTH,
        y: TAB_OFFSET + TAB_WIDTH + BORDER_WIDTH,
      });
      coords.push({
        x: maxX + TAB_WIDTH,
        y: TAB_OFFSET + TAB_WIDTH + TAB_HEIGHT + BORDER_WIDTH,
      });
      coords.push({
        x: maxX,
        y: TAB_OFFSET + TAB_WIDTH + TAB_HEIGHT + TAB_WIDTH + BORDER_WIDTH,
      });
    }

    //bottom right
    coords.push({ x: maxX, y: maxY });

    //bottom left
    coords.push({ x: minX, y: maxY });

    // //left tab (override radius)
    if (!this.isStart() && !this.isAddBlock()) {
      coords.push({
        x: minX,
        y: TAB_OFFSET + TAB_WIDTH + TAB_HEIGHT + TAB_WIDTH + BORDER_WIDTH,
      });
      coords.push({
        x: minX + TAB_WIDTH,
        y: TAB_OFFSET + TAB_WIDTH + TAB_HEIGHT + BORDER_WIDTH,
      });
      coords.push({
        x: minX + TAB_WIDTH,
        y: TAB_OFFSET + TAB_WIDTH + BORDER_WIDTH,
      });
      coords.push({ x: minX, y: TAB_OFFSET + BORDER_WIDTH });
    }

    //generate rounded corner path
    path = this.createRoundedPath(coords, BORDER_RADIUS, closePath);

    return path;
  }

  //********************************************
  //requires an array of {x:0, y:0} coordinate pairs
  //based on https://stackoverflow.com/questions/10177985/svg-rounded-corner/65186378#65186378
  createRoundedPath(
    coords: Array<{ x: number; y: number; radius?: number }>,
    radius = 8,
    close = true,
  ) {
    let path = '';
    const length = coords.length + (close ? 1 : -1);

    for (let i = 0; i < length; i++) {
      const a = coords[i % coords.length];
      const b = coords[(i + 1) % coords.length];

      //added to allow override of radius at coordinate level
      let thisRadius = a.radius && a.radius > 0 ? a.radius : radius;
      const t = Math.min(
        Number(thisRadius) / Math.hypot(b.x - a.x, b.y - a.y),
        0.5,
      );
      //      const t = Math.min(Number(radius) / Math.hypot(b.x - a.x, b.y - a.y), 0.5);

      if (i > 0) {
        path += `Q${a.x},${a.y} ${a.x * (1 - t) + b.x * t},${
          a.y * (1 - t) + b.y * t
        }`;
      }

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

    if (close) {
      path += 'Z';
    }

    return path;
  }

  // Check if the block is placeholder for another block
  isAddBlock() {
    return !this.block.svgUrl;
  }

  // check if it's a starting block
  isStart() {
    return this.block.index === 0;
  }

  // check if it's an ending block
  isEnd() {
    return this.block.index === this.blockSet.moleculeSize - 1;
  }

  removeBlock() {
    this.deleteBlock.emit(this.block.index);
  }
}
