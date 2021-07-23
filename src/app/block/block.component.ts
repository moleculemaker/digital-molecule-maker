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
  size: String = 'default'; //todo: make this enum of default, large, small

  @ViewChild('svgImage') svg:any = null;

  dimensions:any = {
    width: 110,
    height: 68
  };

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
  }

  onLoadSVG(svgElement:any) {
//todo: get rid of the setTimeout hack and properly fire the (load) event AFTER the svg has rendered on the page
    setTimeout(()=>{
      let svg_info = this.svg.nativeElement.viewBox.baseVal;

      this.dimensions.width = svg_info.width;
      this.dimensions.height = svg_info.height;
    }, 150);
  }

  isStart() {
    return (this.type == 'start') ? true : false;
  }

  isEnd() {
    return (this.type == 'end') ? true : false;
  }

//todo: determine if this should be a separate property to control it, for now, show the add block structure if no svgUrl has been added
  isAddBlock() {
    return (!this.svgUrl) ? true : false;
  }
}
