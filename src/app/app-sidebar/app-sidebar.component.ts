import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit {
  @Input()
  currentBlockType: String = 'start';
//  currentBlockType:String = 'start'; //todo: need to change this to different structure like selecting the actual tab data instead of just the index

  @Output()
  onSelectBlock = new EventEmitter<Object>();

  @Output()
  onSelectTab = new EventEmitter<String>();

  currentToggle:String = 'build';

  //todo: change to real data or map object
  blockData:any = new Map(Object.entries({
    'start': [
      {
        type: 'start',
        label: 'Helium',
        svgUrl: 'assets/test_svg_001.svg'
      },
      {
        type: 'start',
        label: 'Sodium',
        svgUrl: 'assets/test_svg_002.svg'
      },
      {
        type: 'start',
        label: 'Oxygen',
        svgUrl: 'assets/test_svg_003.svg'
      },
      {
        type: 'start',
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg'
      },
      {
        type: 'start',
        label: 'Hydrogen',
        svgUrl: 'assets/test_svg_002.svg'
      },
      {
        type: 'start',
        label: 'Zinc',
        svgUrl: 'assets/test_svg_001.svg'
      },
      {
        type: 'start',
        label: 'Ultimatium',
        svgUrl: 'assets/test_svg_003.svg'
      },
    ],

    'middle': [
      {
        type: 'middle',
        label: 'Oxygen',
        svgUrl: 'assets/test_svg_003.svg'
      },
      {
        type: 'middle',
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg'
      },
    ],

    'end': [
      {
        type: 'end',
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg'
      },
      {
        type: 'end',
        label: 'Hydrogen',
        svgUrl: 'assets/test_svg_002.svg'
      },
      {
        type: 'end',
        label: 'Zinc',
        svgUrl: 'assets/test_svg_001.svg'
      },
    ],
  }));

  constructor() { }

  //********************************************
  ngOnInit(): void {
  }

  //********************************************
  onChangeToggle(newToggle:String) {
    this.currentToggle = newToggle;
  }

  //********************************************
  getBlockData() {
    return this.blockData.get(this.currentBlockType);
  }

  //********************************************
  getBlockDataLength() {
    return this.getBlockData().length;
  }

  //********************************************
  getBlockDataKeys() {
    let keys = Array.from(this.blockData.keys());

//todo: fix this code so it properly returns the data keys instead of hard coding
return ['start', 'middle', 'end'];
//    return Array.from(this.blockData.keys());
  }

  //********************************************
  selectTab(newTab:String) {
    this.onSelectTab.emit(newTab);
  }

  //********************************************
  selectBlock(block:any) {
    this.onSelectBlock.emit(block);
  }
}
