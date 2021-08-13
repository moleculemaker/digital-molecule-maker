import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Block, BlockSet, BlockType } from '../models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit {
  @Input()
  currentBlockType = BlockType.Start;
//  currentBlockType:String = 'start'; //todo: need to change this to different structure like selecting the actual tab data instead of just the index

  @Output()
  onSelectBlock = new EventEmitter<Block>();

  @Output()
  onSelectTab = new EventEmitter<BlockType>();

  currentToggle = 'build';

  //todo: change to real data or map object
  blockData = {
    [BlockType.Start]: [
      {
        type: BlockType.Start,
        label: 'Helium',
        svgUrl: 'assets/test_svg_001.svg',
        width: 155,
        height: 160
      },
      {
        type: BlockType.Start,
        label: 'Sodium',
        svgUrl: 'assets/test_svg_002.svg',
        width: 182,
        height: 106
      },
      {
        type: BlockType.Start,
        label: 'Oxygen',
        svgUrl: 'assets/test_svg_003.svg',
        width: 224,
        height: 96
      },
      {
        type: BlockType.Start,
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg',
        width: 88,
        height: 43
      },
      {
        type: BlockType.Start,
        label: 'Hydrogen',
        svgUrl: 'assets/test_svg_002.svg',
        width: 182,
        height: 106
      },
      {
        type: BlockType.Start,
        label: 'Zinc',
        svgUrl: 'assets/test_svg_001.svg',
        width: 155,
        height: 160
      },
      {
        type: BlockType.Start,
        label: 'Ultimatium',
        svgUrl: 'assets/test_svg_003.svg',
        width: 224,
        height: 96
      },
    ],

    [BlockType.Middle]: [
      {
        type: BlockType.Middle,
        label: 'Oxygen',
        svgUrl: 'assets/test_svg_003.svg',
        width: 224,
        height: 96
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg',
        width: 88,
        height: 43
      },
    ],

    [BlockType.End]: [
      {
        type: BlockType.End,
        label: 'Magnesium',
        svgUrl: 'assets/test_svg_004.svg',
        width: 88,
        height: 43
      },
      {
        type: BlockType.End,
        label: 'Hydrogen',
        svgUrl: 'assets/test_svg_002.svg',
        width: 182,
        height: 106
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/test_svg_001.svg',
        width: 155,
        height: 160
      },
    ],
  } as BlockSet;

  constructor() { }

  //********************************************
  ngOnInit(): void {
  }

  //********************************************
  onChangeToggle(newToggle: string) {
    this.currentToggle = newToggle;
  }

  //********************************************
  getBlockData(): Block[] {
    return this.blockData[this.currentBlockType];
  }

  //********************************************
  getBlockDataLength() {
    return this.getBlockData().length;
  }

  //********************************************
  getBlockDataKeys(): BlockType[] {
//todo: fix this code so it properly returns the data keys instead of hard coding
return [BlockType.Start, BlockType.Middle, BlockType.End];
  }

  //********************************************
  selectTab(newTab: BlockType) {
    this.onSelectTab.emit(newTab);
  }

  //********************************************
  selectBlock(block: Block) {
    this.onSelectBlock.emit(block);
  }
}
