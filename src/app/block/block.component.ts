import { Component, Input, OnInit, ElementRef, ViewChild } from '@angular/core';

import "external-svg-loader";

@Component({
  selector: 'block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
  @Input()
  svgUrl: String = '';

  @Input()
  type: String = 'start'; //todo: make this enum of start, middle, end

  @Input()
  label: String = '';

  @Input()
  size: String = 'default'; //todo: make this enum of default, large, small, icon

  @Input()
  iconLabel: String = ''; //if set, then we display the entire block as a small icon

  @Input()
  imageWidth: Number = 80;

  @Input()
  imageHeight: Number = 80;

  @ViewChild('svgImage') svg:any = null;

  padding:any = {
    x: 20 * 4,
    y: 20 * 1.5
  };

  strokeWidth:number = 4;
  strokeDasharray:String = "";

  borderRadius:number = 4;

  sizeSmallScale = .5;

  blockWidth:number = 80;
  blockHeight:number = 80;

  tabOffset:number = 20; //px down from top
  tabHeight:number = 28; //px tall (middle of tab)
  tabRadius:number = 2; //px rounded corners
  tabWidth:number = 20; //px wide    related to margin-left in app-build.scss - if you adjust one, adjust the other

  constructor() { }

  //********************************************
  ngOnInit(): void {
    //use base image size
    if (!this.imageWidth) {this.imageWidth = 80;}
    if (!this.imageHeight) {this.imageHeight = 80;}

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
    if (this.isSmall()) {this.borderRadius = 4;}

    //change width / height if icon
    if (this.isIcon()) {
      this.padding.x = 8 * 3;
      this.padding.y = 8 * 1.5;

      this.imageWidth = 32;
      this.imageHeight = 24;
    }

    //change width / height if small size
    if (this.isSmall()) {
      this.padding.x = 16 * 3;
//      this.padding.y = 20 * 1.5;

      this.tabHeight = 28 * this.sizeSmallScale;
      this.tabOffset = 20;
      this.tabRadius = 2 * this.sizeSmallScale;
      this.tabWidth = 20 * this.sizeSmallScale;

      this.imageWidth = Number(this.imageWidth) * this.sizeSmallScale;
      this.imageHeight = Number(this.imageHeight) * this.sizeSmallScale;
    }

    //set block dimensions
    //track this separately than image dimensions so we can make sure the min size of block is valid
    this.blockWidth = Number(this.imageWidth); // + this.padding.x;
    this.blockHeight = Number(this.imageHeight); // + this.padding.y;

    //min width and height
    if (!this.isIcon()) {
      //believe this only happens if no svgURL was provided
      let minSize = (this.isSmall()) ? 46 : 80;

      if (this.blockWidth < minSize) {this.blockWidth = minSize;}
      if (this.blockHeight < minSize) {this.blockHeight = minSize;}
    }

    //make dashes
    if (this.isDefaultSize() && this.isAddBlock()) {this.strokeDasharray = "4 2";}
  }

  //********************************************
  ngAfterViewInit() {
  }

  //********************************************
//can delete this load event if unable to properly calculate viewBox width and height info from loaded svg file
  onLoadSVG(svgElement:any) {
    //todo: get rid of the setTimeout hack and properly fire the (load) event AFTER the svg has rendered on the page
    setTimeout(()=>{
      let svg_info = this.svg.nativeElement.viewBox.baseVal;

//      this.imageWidth = svg_info.width;
//      this.imageHeight = svg_info.height;
    }, 150);
  }

  //********************************************
  buildImageViewbox() {
    //will make the viewbox dimensions larger in turn shrinking the image
    let width = (this.isSmall()) ? Number(this.imageWidth) / this.sizeSmallScale : this.imageWidth;
    let height = (this.isSmall()) ? Number(this.imageHeight) / this.sizeSmallScale : this.imageHeight;

    return '0 0 ' + width + ' ' + height;
  }

  //********************************************
  drawBlock() {
    let path = '';
    let hasRightTab = (!this.isEnd() && !this.isAddBlock()) ? true : false;

    let minX = this.strokeWidth;
    let minY = this.strokeWidth;
//    let maxX = this.imageWidth + this.padding.x - this.strokeWidth;
//    let maxY = this.imageHeight + this.padding.y - this.strokeWidth;
    let maxX = this.blockWidth + this.padding.x - this.strokeWidth;
    let maxY = this.blockHeight + this.padding.y - this.strokeWidth;

    let closePath = true;

    //adjust max if right tab
    if (hasRightTab) {maxX = maxX - this.tabWidth;}

    //no need to show left border
    if (this.isAddBlock() && !this.isStart()) {
      closePath = false;
      this.tabRadius = 1;
    }

    //build list of coordinates

    let coords:any = [];

    //start upper left
    coords.push({x:minX, y:minY});

    //top right
    coords.push({x:maxX, y:minY});

    //right tab (override radius)
    if (hasRightTab) {
      coords.push({x:maxX, y:this.tabOffset, radius:this.tabRadius});
      coords.push({x:maxX + this.tabWidth, y:this.tabOffset + this.tabWidth, radius:this.tabRadius});
      coords.push({x:maxX + this.tabWidth, y:this.tabOffset + this.tabWidth + this.tabHeight, radius:this.tabRadius});
      coords.push({x:maxX, y:this.tabOffset + this.tabWidth + this.tabHeight + this.tabWidth});
    }

    //bottom right
    coords.push({x:maxX, y:maxY});

    //bottom left
    coords.push({x:minX, y:maxY});

    //left tab (override radius)
    if (!this.isStart() && !this.isAddBlock()) {
      coords.push({x:minX, y:this.tabOffset + this.tabWidth + this.tabHeight + this.tabWidth, radius:this.tabRadius});
      coords.push({x:minX + this.tabWidth, y:this.tabOffset + this.tabWidth + this.tabHeight, radius:this.tabRadius});
      coords.push({x:minX + this.tabWidth, y:this.tabOffset + this.tabWidth, radius:this.tabRadius});
      coords.push({x:minX, y:this.tabOffset});
    }

    //generate rounded corner path
    path = this.createRoundedPath(coords, this.borderRadius, closePath);

    return path;
  }

  //********************************************
  //requires an array of {x:0, y:0} coordinate pairs
  //based on https://stackoverflow.com/questions/10177985/svg-rounded-corner/65186378#65186378
  createRoundedPath(coords:any, radius:Number=8, close:Boolean=true) {
    let path = "";
    const length = coords.length + (close ? 1 : -1);

    for (let i = 0; i < length; i++) {
      const a = coords[i % coords.length];
      const b = coords[(i + 1) % coords.length];

      //added to allow override of radius at coordinate level
      let thisRadius = (a.radius > 0) ? a.radius : radius;
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

  //********************************************
  isStart() {
    return (this.type == 'start') ? true : false;
  }

  //********************************************
  isEnd() {
    return (this.type == 'end') ? true : false;
  }

  //********************************************
  isDefaultSize() {
    return (this.size == 'default') ? true : false;
  }

  //********************************************
  isSmall() {
    return (this.size == 'small') ? true : false;
  }

  //********************************************
  isIcon() {
    return (this.size == 'icon') ? true : false;
  }

  //********************************************
//todo: determine if this should be a separate property to control it, for now, show the add block structure if no svgUrl has been added
  isAddBlock() {
    return (!this.iconLabel && !this.svgUrl) ? true : false;
  }
}
