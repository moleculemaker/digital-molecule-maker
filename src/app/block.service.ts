import { Injectable } from '@angular/core';
import { BlockSet, BlockType } from './models';

@Injectable({
  providedIn: 'root'
})
export class BlockService {

  constructor() { }

  getBlockSet(blockSetId: '10x10x10palette' | 'pentamers'): BlockSet {
    if (blockSetId === '10x10x10palette') {
      return BLOCK_SET_10x10x10_PALETTE;
    } else if (blockSetId === 'pentamers') {
      return BLOCK_SET_PENTAMERS;
    }
    throw new Error('Unknown blockSetId ' + blockSetId);
  }
}

export const BLOCK_SET_10x10x10_PALETTE = {
  [BlockType.Start]: [
    {
      type: BlockType.Start,
      id: '1', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_1.svg',
      width: 71.33,
      height: 63.07
    },
    {
      type: BlockType.Start,
      id: '2', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_2.svg',
      width: 73.43,
      height: 37.06
    },
    {
      type: BlockType.Start,
      id: '3', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_3.svg',
      width: 39.59,
      height: 29.9
    },
    {
      type: BlockType.Start,
      id: '4', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_4.svg',
      width: 67.16,
      height: 31.4
    },
    {
      type: BlockType.Start,
      id: '5', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_5.svg',
      width: 95.59,
      height: 38.05
    },
    {
      type: BlockType.Start,
      id: '6', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_6.svg',
      width: 56.45,
      height: 56.22
    },
    {
      type: BlockType.Start,
      id: '7', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_7.svg',
      width: 54.06,
      height: 51.1
    },
    {
      type: BlockType.Start,
      id: '8', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_8.svg',
      width: 42.31,
      height: 29.23
    },
    {
      type: BlockType.Start,
      id: '9', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_9.svg',
      width: 55.31,
      height: 74.56
    },
    {
      type: BlockType.Start,
      id: '10', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_10.svg',
      width: 66.55,
      height: 34.46
    }
  ],

  [BlockType.Middle]: [
    {
      type: BlockType.Middle,
      id: '1', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_11.svg',
      width: 58.67,
      height: 29.24
    },
    {
      type: BlockType.Middle,
      id: '2', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_12.svg',
      width: 59.74,
      height: 34.72
    },
    {
      type: BlockType.Middle,
      id: '3', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_13.svg',
      width: 68.71,
      height: 25.54
    },
    {
      type: BlockType.Middle,
      id: '4', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_14.svg',
      width: 53.19,
      height: 60.76
    },
    {
      type: BlockType.Middle,
      id: '5', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_15.svg',
      width: 59.62,
      height: 60.76
    },
    {
      type: BlockType.Middle,
      id: '6', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_16.svg',
      width: 65.92,
      height: 71.69
    },
    {
      type: BlockType.Middle,
      id: '7', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_17.svg',
      width: 84.46,
      height: 35.56
    },
    {
      type: BlockType.Middle,
      id: '8', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_18.svg',
      width: 93.72,
      height: 33.05
    },
    {
      type: BlockType.Middle,
      id: '9', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_19.svg',
      width: 54.2,
      height: 45.01
    },
    {
      type: BlockType.Middle,
      id: '10', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_20.svg',
      width: 66.37,
      height: 59.03
    }
  ],

  [BlockType.End]: [
    {
      type: BlockType.End,
      id: '1', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_21.svg',
      width: 43.26,
      height: 55.17
    },
    {
      type: BlockType.End,
      id: '2', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_22.svg',
      width: 36.31,
      height: 36.36
    },
    {
      type: BlockType.End,
      id: '3', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_23.svg',
      width: 65.77,
      height: 62.9
    },
    {
      type: BlockType.End,
      id: '4', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_24.svg',
      width: 71.52,
      height: 49.21
    },
    {
      type: BlockType.End,
      id: '5', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_25.svg',
      width: 42.51,
      height: 75.33
    },
    {
      type: BlockType.End,
      id: '6', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_26.svg',
      width: 44.32,
      height: 50.48
    },
    {
      type: BlockType.End,
      id: '7', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_27.svg',
      width: 37.62,
      height: 31.01
    },
    {
      type: BlockType.End,
      id: '8', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_28.svg',
      width: 49.2,
      height: 25.62
    },
    {
      type: BlockType.End,
      id: '9', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_29.svg',
      width: 66.65,
      height: 46.56
    },
    {
      type: BlockType.End,
      id: '10', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/10x10x10palette/asset_30.svg',
      width: 65.5,
      height: 39.38
    }
  ],
} as BlockSet;

export const BLOCK_SET_PENTAMERS = {
  [BlockType.Start]: [
    {
      type: BlockType.Start,
      id: '1', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab1_block01.svg',
      width: 95.31,
      height: 28.06
    }
  ],

  [BlockType.Middle]: [
    {
      type: BlockType.Middle,
      id: '1', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab2_block01.svg',
      width: 71.39,
      height: 43.24
    }
  ],

  [BlockType.End]: [
    {
      type: BlockType.End,
      id: '1', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block01.svg',
      width: 93.52,
      height: 54.77
    },
    {
      type: BlockType.End,
      id: '2', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block02.svg',
      width: 81.18,
      height: 55.54
    },
    {
      type: BlockType.End,
      id: '3', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block03.svg',
      width: 56.74,
      height: 52.55
    },
    {
      type: BlockType.End,
      id: '4', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block04.svg',
      width: 92.36,
      height: 51.86
    },
    {
      type: BlockType.End,
      id: '5', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block05.svg',
      width: 59.48,
      height: 35.02
    },
    {
      type: BlockType.End,
      id: '6', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block06.svg',
      width: 59.42,
      height: 36
    },
    {
      type: BlockType.End,
      id: '7', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block07.svg',
      width: 168.34,
      height: 35.67
    },
    {
      type: BlockType.End,
      id: '8', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block08.svg',
      width: 64.6,
      height: 53.5
    },
    {
      type: BlockType.End,
      id: '9', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block09.svg',
      width: 68.88,
      height: 65.25
    },
    {
      type: BlockType.End,
      id: '10', // these aren't unique identifiers yet
      label: '',
      svgUrl: 'assets/blocks/pentamers/tab3_block10.svg',
      width: 71.39,
      height: 43.24
    }
  ],
} as BlockSet;
