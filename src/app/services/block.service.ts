import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {BlockSet, DFTData} from '../models';

export enum BlockSetId {
  ColorWheel = 'COLOR_WHEEL',
  OPV = 'OPV',
}

import {Block, BlockPoint, BlockType, Bounds} from "../models";

const D_COMMON_NAME = ['thiophene', 'bithiophene', 'benzodithiophene']
const B_COMMON_NAME = ['none', 'thiophene', 'selenophene', 'thienylthiophene', 'bithiophene', 'meta-penyl', 'para-phenyl', 'benzofuran']


export const opv: BlockSet = {
  "id": "OPV_20230504",
  "labelProperty": {
    "key": "blockId",
    "label": "Block Name",
    "displayStrategy": "default",
    "aggregationStrategy": "smiles"
  },
  "primaryProperty": {
    "key": "name",
    "label": "Name",
    "displayStrategy": "default",
    "aggregationStrategy": "sum"
  },
  "firstTierProperties": [],
  "secondTierProperties": [],
  blocks: {
    [BlockType.Start]: Array(3).fill(0).map((_, i) => ({
      type: BlockType.Start,
      id: i + 1,
      svgUrl: '/assets/blocks/opv/S2.svg',
      "width": 174,
      "height": 103,
      properties: {
        "blockId": `Donor ${i + 1}`,
        "name": D_COMMON_NAME[i]
      }
    })),
    [BlockType.Middle]:
      Array(8).fill(0).map((_, i) => ({
        type: BlockType.Middle,
        id: i,
        svgUrl: '/assets/blocks/opv/M2.svg',
        "width": 144,
        "height": 85,
        properties: {
          "blockId": `Bridge ${i}`,
          "name": B_COMMON_NAME[i]
        }
      })),
    [BlockType.End]:
      Array(100).fill(0).map((_, i) => ({
        type: BlockType.End,
        id: i + 1,
        svgUrl: '/assets/blocks/opv/E2.svg',
        "width": 245,
        "height": 140,
        properties: {
          "blockId": `Acceptor ${i + 1}`,
          "name": `???`
        }
      }))

  }
}


const Mapping: Record<string, string> = {
  "D1B0": "DB01",
  "D1B2": "DB02",
  "D1B3": "DB03",
  "D1B4": "DB04",
  "D2B1": "DB04",
  "D1B5": "DB05",
  "D1B6": "DB06",
  "D1B7": "DB07",
  "D1B1": "DB08",
  "D2B0": "DB08",
  "D2B2": "DB09",
  "D2B3": "DB10",
  "D2B4": "DB11",
  "D2B5": "DB12",
  "D2B6": "DB13",
  "D2B7": "DB14",
  "D3B0": "DB15",
  "D3B1": "DB16",
  "D3B2": "DB17",
  "D3B3": "DB18",
  "D3B4": "DB19",
  "D3B5": "DB20",
  "D3B6": "DB21",
  "D3B7": "DB22"
}


@Injectable({
  providedIn: 'root',
})
export class BlockService {
  urls = new Map<BlockSetId, string>([
    [BlockSetId.ColorWheel, 'assets/blocks/10x10x10palette/blocks.json'],
    [BlockSetId.OPV, 'assets/blocks/opv/blocks.json'],
  ]);

  dftLoaded$ = new BehaviorSubject<boolean>(false);
  dft: DFTData[] = [];
  bounds: Bounds = [0,0,0,0];

  constructor(private http: HttpClient) {
    this.http.get<DFTData[]>("/assets/blocks/opv/dft.json").subscribe(dft => {
      this.dft = dft;
      this.bounds = this.enumerateAll().reduce(
        ([minX, maxX, minY, maxY], bp) => [
          Math.min(minX, bp.x),
          Math.max(maxX, bp.x),
          Math.min(minY, bp.y),
          Math.max(maxY, bp.y),
        ],
        [Infinity, -Infinity, Infinity, -Infinity],
      );
      this.dftLoaded$.next(true);
    });
  }

  getBlockSet(blockSetId: BlockSetId): Observable<BlockSet> {
    return of(opv);
    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     Authorization: 'my-auth-token',
    //   }),
    // };
    //
    // return this.http.get<BlockSet>(this.urls.get(blockSetId)!, httpOptions);
  }

  getDFT(blockList: Block[]) {
    let start = 0;
    let middle = 0;
    let end = 0;
    for (let b of blockList) {
      switch (b.type) {
        case BlockType.Start:
          start = b.id;
          break;
        case BlockType.Middle:
          middle = b.id;
          break;
        case BlockType.End:
          end = b.id;
          break;
      }
    }


    const name = Mapping[`D${start}B${middle}`] + `A${String(end).padStart(3, '0')}`;
    return this.dft.find(c => c['DBA_Name'] === name);
  }

  dftX(blockList: Block[]) {
    const entry = this.getDFT(blockList);
    return entry?.['Predicted_SO'] || 0;
    // return blockList.reduce(
    //   (lambda, block) => lambda + block.properties.lambdaMaxShift,
    //   0,
    // );
  }

  dftY(blockList: Block[]) {
    const entry = this.getDFT(blockList);
    return entry?.['Predicted_T80'] || 0;
    // return blockList.reduce(
    //   (weight, block) => weight + block.properties.molecularWeight,
    //   0,
    // );
  }


  enumerateAll(): BlockPoint[] {
    const points: BlockPoint[] = [];

    const enumerate = (curBlocks: Block[], remainingTypes: BlockType[]) => {
      if (!remainingTypes.length) {
        points.push({
          blockList: curBlocks,
          x: this.dftX(curBlocks),
          y: this.dftY(curBlocks),
          focused: false,
        });
        return;
      }
      const [nextType, ...nextRemainingTypes] = remainingTypes;
      for (const nextBlock of opv.blocks[nextType]) {
        enumerate([...curBlocks, nextBlock], nextRemainingTypes);
      }
    };

    enumerate([], Object.values(BlockType) as BlockType[]);
    return points;

  }
}
