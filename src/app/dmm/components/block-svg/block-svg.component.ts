import { CdkOverlayOrigin, ConnectionPositionPair } from '@angular/cdk/overlay';
import {
  Component,
  OnChanges,
  OnDestroy,
  OnInit,
  Input,
  ViewChild,
  SimpleChanges,
  Output,
  EventEmitter,
  ViewContainerRef,
  AfterViewInit,
  createComponent,
  ComponentRef,
  EnvironmentInjector,
  ChangeDetectorRef,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Block, Molecule } from 'app/models';
import { WorkspaceService } from 'app/dmm/services/workspace.service';
import { BlockService } from 'app/dmm/services/block.service';

export const BLOCK_WIDTH = 100;
export const BLOCK_HEIGHT = 100;
export const BLOCK_PADDING_X = 20 * 4;
export const BLOCK_PADDING_Y = 20 * 1.5;

@Component({
  selector: '[dmm-block-svg]',
  templateUrl: './block-svg.component.html',
  styleUrls: ['./block-svg.component.scss'],
})
export class BlockSvgComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
  @Input()
  molecule!: Molecule;

  @Input()
  block!: Block;

  @Input()
  asIcon = false; // currently using this just to control x offset when rendering inside the properties overlay
  // consider handling that offset in the parent component, in the containing <g>

  @Input()
  closeOverlayObservable?: Observable<void>;

  @Input()
  overlayOrigin!: CdkOverlayOrigin;

  @Output()
  deleteBlock = new EventEmitter<void>();

  @ViewChild('functionModeOutlet', { read: ViewContainerRef })
  functionModeOutlet!: ViewContainerRef;

  functionModeComponentRef: ComponentRef<unknown> | null = null;

  scale = 1;

  strokeWidth = 4;
  strokeDasharray = '';

  borderRadius = 4;
  borderOffset = 15;

  tabOffset = 20; //px down from top
  tabHeight = 28; //px tall (middle of tab)
  tabWidth = 20; //px wide tab

  imageZoomAndPanMatrix = [1, 0, 0, 1, 60, 20 + this.borderOffset];

  path = '';

  isInfoPanelOpen = false;
  _eventsSubscription?: Subscription;

  positionPairs!: ConnectionPositionPair[];

  constructor(
    private workspaceService: WorkspaceService,
    private blockService: BlockService,
    private environmentInjector: EnvironmentInjector,
    private cd: ChangeDetectorRef,
  ) {}

  get viewMode$() {
    return this.workspaceService.viewMode$;
  }

  get type() {
    return this.isStart() ? 'start' : this.isEnd() ? 'end' : 'middle';
  }

  get blockSet() {
    return this.blockService.blockSet!;
  }

  get blockPrimaryProperty(): number {
    return this.blockSet.getBlockChemicalProperty(
      this.block,
      this.blockSet.primaryProperty,
    );
  }

  get moleculePrimaryProperty(): number {
    return this.blockSet.predictChemicalProperty(
      this.molecule.blockList,
      this.blockSet.primaryProperty,
    );
  }

  get FunctionModeComponent() {
    return this.blockSet.WorkspaceBlockSVGFunctionModeContentComponent;
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
  }

  ngAfterViewInit() {
    // wait until this change detection cycle is complete
    queueMicrotask(() => {
      /**
       * Creating component instance and setting inputs manually instead of using `*ngComponentOutlet` due to a
       * long-standing bug in Angular -- Dynamically created components always have their dmm elements created in the
       * `xhtml` namespace, whereas SVG requires all elements to be in the `svg` namespace.
       * Currently, the only workaround is to manually call `createElementNS` DOM API with a `svg` namespace URI.
       * See this open issue: https://github.com/angular/angular/issues/10404.
       */
      this.functionModeComponentRef = createComponent(
        this.FunctionModeComponent, // this is the dynamic plug-in component provided by the block set
        {
          environmentInjector: this.environmentInjector,
          hostElement: document.createElementNS(
            'http://www.w3.org/2000/svg',
            'g',
          ),
        },
      );
      this.functionModeComponentRef.setInput(
        'moleculePrimaryProperty',
        this.moleculePrimaryProperty,
      );
      this.functionModeComponentRef.setInput(
        'blockPrimaryProperty',
        this.blockPrimaryProperty,
      );
      this.functionModeComponentRef.setInput('minX', this.minX);
      this.functionModeComponentRef.setInput('maxX', this.maxX);
      this.functionModeComponentRef.setInput('minY', this.minY);
      this.functionModeComponentRef.setInput('maxY', this.maxY);
      this.functionModeOutlet.insert(this.functionModeComponentRef.hostView);
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this._eventsSubscription) this._eventsSubscription.unsubscribe();
    this.functionModeComponentRef?.destroy();
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

  get minX() {
    let res = this.strokeWidth + this.borderOffset;
    if (!this.asIcon) {
      res += this.block.index * (BLOCK_WIDTH + BLOCK_PADDING_X);
      // this.imageZoomAndPanMatrix[4] = res + 60;
    }
    return res;
  }

  get maxX() {
    return BLOCK_WIDTH + BLOCK_PADDING_X + this.minX;
  }

  get minY() {
    return this.strokeWidth + this.borderOffset;
  }

  get maxY() {
    return BLOCK_HEIGHT + BLOCK_PADDING_Y + this.borderOffset;
  }

  drawBlock() {
    this.scale = Math.min(
      BLOCK_HEIGHT / this.block.height,
      BLOCK_WIDTH / this.block.width,
    );
    let path = '';
    let hasRightTab = !this.isEnd() && !this.isAddBlock();
    let minX = this.strokeWidth + this.borderOffset;
    let minY = this.strokeWidth + this.borderOffset;

    if (!this.asIcon) {
      minX += this.block.index * (BLOCK_WIDTH + BLOCK_PADDING_X);
      this.imageZoomAndPanMatrix[4] = minX + 60;
    }

    let maxX = BLOCK_WIDTH + BLOCK_PADDING_X + minX;
    let maxY = BLOCK_HEIGHT + BLOCK_PADDING_Y + this.borderOffset;

    let closePath = true;

    //build list of coordinates
    let coords: Array<{ x: number; y: number; radius?: number }> = [];

    //start upper left
    coords.push({ x: minX, y: minY });

    //top right
    coords.push({ x: maxX, y: minY });

    //right tab (override radius)
    if (hasRightTab) {
      coords.push({ x: maxX, y: this.tabOffset + this.borderOffset });
      coords.push({
        x: maxX + this.tabWidth,
        y: this.tabOffset + this.tabWidth + this.borderOffset,
      });
      coords.push({
        x: maxX + this.tabWidth,
        y: this.tabOffset + this.tabWidth + this.tabHeight + this.borderOffset,
      });
      coords.push({
        x: maxX,
        y:
          this.tabOffset +
          this.tabWidth +
          this.tabHeight +
          this.tabWidth +
          this.borderOffset,
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
        y:
          this.tabOffset +
          this.tabWidth +
          this.tabHeight +
          this.tabWidth +
          this.borderOffset,
      });
      coords.push({
        x: minX + this.tabWidth,
        y: this.tabOffset + this.tabWidth + this.tabHeight + this.borderOffset,
      });
      coords.push({
        x: minX + this.tabWidth,
        y: this.tabOffset + this.tabWidth + this.borderOffset,
      });
      coords.push({ x: minX, y: this.tabOffset + this.borderOffset });
    }

    //generate rounded corner path
    path = this.createRoundedPath(coords, this.borderRadius, closePath);

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
      const a = coords[i % coords.length]!;
      const b = coords[(i + 1) % coords.length]!;

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
    return !this.asIcon && !this.block.svgUrl;
  }

  // check if it's a starting block
  isStart() {
    return this.block.index === 0;
  }

  // check if it's a middle block
  isMiddle() {
    return !this.isStart() && !this.isEnd();
  }

  // check if it's an ending block
  isEnd() {
    return this.block.index === this.blockService.blockSet!.moleculeSize - 1;
  }

  calculateDeletePositionX() {
    let minX =
      this.strokeWidth +
      this.borderOffset +
      this.block.index * (BLOCK_WIDTH + BLOCK_PADDING_X);

    return (BLOCK_WIDTH + BLOCK_PADDING_X) / 2 + minX;
  }

  calculateDeletePositionY() {
    return BLOCK_HEIGHT + BLOCK_PADDING_Y;
  }
}
