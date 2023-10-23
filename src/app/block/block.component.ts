import {
  Component,
  Input,
  OnInit,
  ElementRef,
  ViewChild,
  TemplateRef,
  HostListener,
} from '@angular/core';
import 'external-svg-loader';
import { Block, BlockType } from '../models';
import {
  getTextColorFromBackgroundColor,
  lambdaMaxToColor,
} from '../utils/colors';
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: 'block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss'],
})
export class BlockComponent implements OnInit {
  @Input()
  block!: Block;

  size = BlockSize.Small;
  imageWidth = 0;
  imageHeight = 0;

  @ViewChild('svgImage') svg: ElementRef | null = null;

  padding = {
    x: 20 * 4,
    y: 20 * 1.5,
  };

  strokeWidth = 4;
  strokeDasharray = '';

  borderRadius = 4;

  scales = {
    [BlockSize.Default]: 1.5,
    [BlockSize.Small]: 1.0,
    [BlockSize.Large]: 3.0,
    [BlockSize.Icon]: 2.0,
  };

  blockWidth = 80;
  blockHeight = 80;

  tabOffset = 20; //px down from top
  tabHeight = 28; //px tall (middle of tab)
  tabRadius = 2; //px rounded corners
  tabWidth = 20; //px wide    related to margin-left in app-build.scss - if you adjust one, adjust the other

  flipped = false;
  _functionModeEnabled = false;

  get functionModeEnabled() {
    return this._functionModeEnabled !== this.flipped;
  }

  constructor(public workspaceService: WorkspaceService) {
    workspaceService.functionMode$.subscribe((enabled) => {
      this._functionModeEnabled = enabled;
    });
  }

  @HostListener('click')
  onClick() {
    this.flipped = !this.flipped;
  }

  // @HostListener('mouseover')
  // onHover() {
  //   this.flipped = true;
  // }
  // @HostListener('mouseout')
  // onHoverEnd() {
  //   this.flipped = false;
  // }

  //********************************************
  ngOnInit(): void {
    this.imageWidth = this.block.width;
    this.imageHeight = this.block.height;

    //change border size for icons
    if (this.isIcon()) {
      this.borderRadius = 1;
      this.strokeWidth = 1;

      this.tabHeight = 10;
      this.tabOffset = 8;
      this.tabRadius = 1;
      this.tabWidth = 5;
    }

    //for small
    if (this.isSmall()) {
      this.borderRadius = 4;
    }

    //change width / height if icon
    if (this.isIcon()) {
      this.padding.x = 8 * 3;
      this.padding.y = 8 * 1.5;

      this.imageWidth = 32;
      this.imageHeight = 24;
    }

    //change width / height
    if (this.isSmall()) {
      this.padding.x = 16 * 3;
      //      this.padding.y = 20 * 1.5;
    }

    if (this.isSmall() || this.isDefaultSize() || this.isLarge()) {
      const scale = this.scales[BlockSize.Small];

      this.tabHeight = 28 * scale;
      this.tabOffset = 20;
      this.tabRadius = 2 * scale;
      this.tabWidth = 20 * scale;

      /* TODO reconsider scaling of images and blocks
      this.imageHeight = this.imageHeight * scale;
      this.imageWidth = this.imageWidth * scale;
       */
    }
    /* TODO reconsider scaling of images and blocks
    //set block dimensions
    //track this separately than image dimensions so we can make sure the min size of block is valid
    this.blockWidth = this.imageWidth + this.padding.x;
    this.blockHeight = this.imageHeight + this.padding.y;
     */

    //min width and height
    if (!this.isIcon()) {
      //believe this only happens if no svgURL was provided
      let minSize = this.isSmall() ? 100 : 150;

      if (this.blockWidth < minSize) {
        this.blockWidth = minSize;
      }
      if (this.blockHeight < minSize) {
        this.blockHeight = minSize;
      }
    }

    //make dashes
    if (this.isDefaultSize() && this.isAddBlock()) {
      this.strokeDasharray = '4 2';
    }
  }

  //********************************************
  ngAfterViewInit() {}

  //********************************************
  onLoadSVG(event: any) {
    // const viewBoxPieces = event.path[0].attributes.getNamedItem('viewBox').value.split(" ");
    //const scale = this.scales[this.size];
    //this.imageWidth = parseInt(viewBoxPieces[2], 10) * scale;
    //this.imageHeight = parseInt(viewBoxPieces[3], 10) * scale;
  }

  //********************************************
  buildImageViewbox() {
    //will make the viewbox dimensions larger in turn shrinking the image
    const scale = this.scales[this.size];
    let width = this.imageWidth / scale;
    let height = this.imageHeight / scale;

    return '0 0 ' + width + ' ' + height;
  }

  get centerX() {
    let minX = this.strokeWidth;
    let maxX = this.blockWidth + this.padding.x - this.strokeWidth;
    return (minX + maxX) / 2;
  }

  get centerY() {
    let minY = this.strokeWidth;
    let maxY = this.blockHeight + this.padding.y - this.strokeWidth;
    return (minY + maxY) / 2;
  }

  get lambdaMax() {
    return this.block.properties['lambdaMaxShift'];
  }

  //********************************************
  drawBlock() {
    let path = '';
    let hasRightTab = !this.isEnd() && !this.isAddBlock() ? true : false;

    let minX = this.strokeWidth;
    let minY = this.strokeWidth;
    //    let maxX = this.imageWidth + this.padding.x - this.strokeWidth;
    //    let maxY = this.imageHeight + this.padding.y - this.strokeWidth;
    let maxX = this.blockWidth + this.padding.x - this.strokeWidth;
    let maxY = this.blockHeight + this.padding.y - this.strokeWidth;

    let closePath = true;

    //adjust max if right tab
    if (hasRightTab) {
      maxX = maxX - this.tabWidth;
    }

    //no need to show left border
    if (this.isAddBlock() && !this.isStart()) {
      closePath = false;
      this.tabRadius = 1;
    }

    //build list of coordinates

    let coords: Array<{ x: number; y: number; radius?: number }> = [];

    //start upper left
    coords.push({ x: minX, y: minY });

    //top right
    coords.push({ x: maxX, y: minY });

    //right tab (override radius)
    if (hasRightTab) {
      coords.push({ x: maxX, y: this.tabOffset, radius: this.tabRadius });
      coords.push({
        x: maxX + this.tabWidth,
        y: this.tabOffset + this.tabWidth,
        radius: this.tabRadius,
      });
      coords.push({
        x: maxX + this.tabWidth,
        y: this.tabOffset + this.tabWidth + this.tabHeight,
        radius: this.tabRadius,
      });
      coords.push({
        x: maxX,
        y: this.tabOffset + this.tabWidth + this.tabHeight + this.tabWidth,
      });
    }

    //bottom right
    coords.push({ x: maxX, y: maxY });

    //bottom left
    coords.push({ x: minX, y: maxY });

    //left tab (override radius)
    if (!this.isStart() && !this.isAddBlock()) {
      coords.push({
        x: minX,
        y: this.tabOffset + this.tabWidth + this.tabHeight + this.tabWidth,
        radius: this.tabRadius,
      });
      coords.push({
        x: minX + this.tabWidth,
        y: this.tabOffset + this.tabWidth + this.tabHeight,
        radius: this.tabRadius,
      });
      coords.push({
        x: minX + this.tabWidth,
        y: this.tabOffset + this.tabWidth,
        radius: this.tabRadius,
      });
      coords.push({ x: minX, y: this.tabOffset });
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

  //********************************************
  isStart() {
    return this.block.type === BlockType.Start;
  }

  //********************************************
  isEnd() {
    return this.block.type === BlockType.End;
  }

  //********************************************
  isDefaultSize() {
    return this.size === BlockSize.Default;
  }

  //********************************************
  isSmall() {
    return this.size === BlockSize.Small;
  }

  //********************************************
  isLarge() {
    return this.size === BlockSize.Large;
  }

  //********************************************
  isIcon() {
    return this.size === BlockSize.Icon;
  }

  //********************************************
  //todo: determine if this should be a separate property to control it, for now, show the add block structure if no svgUrl has been added
  isAddBlock() {
    return !this.block.svgUrl ? true : false;
  }

  get textColor() {
    return getTextColorFromBackgroundColor(this.fillColor);
  }

  get fillColor() {
    return lambdaMaxToColor(this.block.properties['lambdaMaxShift'], {
      opacity: 0.5,
    });
  }

  get strokeColor() {
    return lambdaMaxToColor(this.block.properties['lambdaMaxShift']);
  }
}

export enum BlockSize {
  Default = 'default',
  Small = 'small',
  Large = 'large',
  Icon = 'icon',
}
