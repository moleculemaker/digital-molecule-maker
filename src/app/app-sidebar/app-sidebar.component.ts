import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlockSize } from '../block/block.component';
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
  BlockSize = BlockSize; // for use in template

  //todo: change to real data or map object
  blockData = {
    [BlockType.Start]: [
      {
        type: BlockType.Start,
        label: 'Helium',
        svgUrl: 'assets/blocks/asset_1.svg',
        width: 71.33,
        height: 63.07
      },
      {
        type: BlockType.Start,
        label: 'Sodium',
        svgUrl: 'assets/blocks/asset_2.svg',
        width: 73.43,
        height: 37.06
      },
      {
        type: BlockType.Start,
        label: 'Oxygen',
        svgUrl: 'assets/blocks/asset_3.svg',
        width: 39.59,
        height: 29.9
      },
      {
        type: BlockType.Start,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_4.svg',
        width: 67.16,
        height: 31.4
      },
      {
        type: BlockType.Start,
        label: 'Hydrogen',
        svgUrl: 'assets/blocks/asset_5.svg',
        width: 95.59,
        height: 38.05
      },
      {
        type: BlockType.Start,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_6.svg',
        width: 56.45,
        height: 56.22
      },
      {
        type: BlockType.Start,
        label: 'Ultimatium',
        svgUrl: 'assets/blocks/asset_7.svg',
        width: 54.06,
        height: 51.1
      },
      {
        type: BlockType.Start,
        label: 'Ultimatium',
        svgUrl: 'assets/blocks/asset_8.svg',
        width: 42.31,
        height: 29.23
      },
      {
        type: BlockType.Start,
        label: 'Ultimatium',
        svgUrl: 'assets/blocks/asset_9.svg',
        width: 55.31,
        height: 74.56
      },
      {
        type: BlockType.Start,
        label: 'Ultimatium',
        svgUrl: 'assets/blocks/asset_10.svg',
        width: 66.55,
        height: 34.46
      }
    ],

    [BlockType.Middle]: [
      {
        type: BlockType.Middle,
        label: 'Oxygen',
        svgUrl: 'assets/blocks/asset_11.svg',
        width: 58.67,
        height: 29.24
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_12.svg',
        width: 59.74,
        height: 34.72
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_13.svg',
        width: 68.71,
        height: 25.54
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_14.svg',
        width: 53.19,
        height: 60.76
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_15.svg',
        width: 59.62,
        height: 60.76
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_16.svg',
        width: 65.92,
        height: 71.69
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_17.svg',
        width: 84.46,
        height: 35.56
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_18.svg',
        width: 93.72,
        height: 33.05
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_19.svg',
        width: 54.2,
        height: 45.01
      },
      {
        type: BlockType.Middle,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_20.svg',
        width: 66.37,
        height: 59.03
      }
    ],

    [BlockType.End]: [
      {
        type: BlockType.End,
        label: 'Magnesium',
        svgUrl: 'assets/blocks/asset_21.svg',
        width: 43.26,
        height: 55.17
      },
      {
        type: BlockType.End,
        label: 'Hydrogen',
        svgUrl: 'assets/blocks/asset_22.svg',
        width: 36.31,
        height: 36.36
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_23.svg',
        width: 65.77,
        height: 62.9
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_24.svg',
        width: 71.52,
        height: 49.21
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_25.svg',
        width: 42.51,
        height: 75.33
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_26.svg',
        width: 44.32,
        height: 50.48
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_27.svg',
        width: 37.62,
        height: 31.01
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_28.svg',
        width: 49.2,
        height: 25.62
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_29.svg',
        width: 66.65,
        height: 46.56
      },
      {
        type: BlockType.End,
        label: 'Zinc',
        svgUrl: 'assets/blocks/asset_30.svg',
        width: 65.5,
        height: 39.38
      }
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
