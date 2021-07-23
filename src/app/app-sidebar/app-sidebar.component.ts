import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit {
  currentToggle:String = 'build';
  currentBlockType:String = 'start'; //todo: need to change this to differnt structure like selecting the actual tab data instead of just the index

  //todo: change to real data or map object
  blockData:any = new Map(Object.entries({
    'start': [
      {
        label: 'Helium',
        svgUrl: 'assets/test_svg_001.svg'
      },
      {
        label: 'Sodium',
        svgUrl: 'assets/test_svg_002.svg'
      },
      {
        label: 'Oxygen',
        svgUrl: 'assets/test_svg_003.svg'
      },
      {
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg'
      },
      {
        label: 'Hydrogen',
        svgUrl: 'assets/test_svg_002.svg'
      },
      {
        label: 'Zinc',
        svgUrl: 'assets/test_svg_001.svg'
      },
      {
        label: 'Ultimatium',
        svgUrl: 'assets/test_svg_003.svg'
      },
    ],

    'middle': [
      {
        label: 'Oxygen',
        svgUrl: 'assets/test_svg_003.svg'
      },
      {
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg'
      },
    ],

    'end': [
      {
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg'
      },
      {
        label: 'Hydrogen',
        svgUrl: 'assets/test_svg_002.svg'
      },
      {
        label: 'Zinc',
        svgUrl: 'assets/test_svg_001.svg'
      },
    ],
  }));

  constructor() { }

  ngOnInit(): void {
  }

  onChangeToggle(newToggle:String) {
    this.currentToggle = newToggle;
  }

  onSelectTab(newTab:String) {
    this.currentBlockType = newTab;
  }

  getBlockData() {
    return this.blockData.get(this.currentBlockType);
  }

  getBlockDataKeys() {
    let keys = Array.from(this.blockData.keys());

//todo: fix this code so it properly returns the data keys instead of hard coding
return ['start', 'middle', 'end'];
//    return Array.from(this.blockData.keys());
  }
}
