import { forkJoin, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  Block,
  BlockPropertyDefinition,
  BlockSet,
  FilterDescriptor,
} from '../../models';
import { Injectable } from '@angular/core';
import { getSVGViewBox } from '../../utils/SVG';
import { map, tap } from 'rxjs/operators';
import { CWBlockTypeFilterComponent } from './cw-block-type-filter/cw-block-type-filter.component';
import { LambdaMaxRangeForColor } from '../../utils/colors';
import { CWColorFilterComponent } from './cw-color-filter/cw-color-filter.component';

type ColorWheelBlockSetJSON = {
  id: string;
  labelProperty: BlockPropertyDefinition;
  primaryProperty: BlockPropertyDefinition;
  firstTierProperties: BlockPropertyDefinition[];
  secondTierProperties: BlockPropertyDefinition[];
  blocks: {
    start: Block[];
    middle: Block[];
    end: Block[];
  };
};

const ASSET_URL = 'assets/blocks/10x10x10palette/blocks.json';
const ALL_COLORS = [
  'uva',
  'uvb',
  'uvc',
  'yellow',
  'orange',
  'red',
  'magenta',
  'violet',
  'blue',
  'cyan',
];

@Injectable({
  providedIn: 'root',
})
export class ColorWheelBlockSet extends BlockSet {
  id: string = 'COLOR_WHEEL';

  _json!: ColorWheelBlockSetJSON;

  get labelProperty() {
    return this._json.labelProperty;
  }
  get primaryProperty() {
    return this._json.primaryProperty;
  }

  get firstTierProperties() {
    return this._json.firstTierProperties;
  }
  get secondTierProperties() {
    return this._json.secondTierProperties;
  }

  filterDescriptors: FilterDescriptor[] = [
    {
      type: 'source_categories',
      availableIn: ['structure'],
      Component: CWBlockTypeFilterComponent,
      initialValue: ['start', 'middle', 'end'],
      categories: ['start', 'middle', 'end'],
      mapArgToValue: (block) => {
        if (block.index === 0) return ['start'];
        if (block.index === 2) return ['end'];
        return ['middle'];
      },
    },
    {
      type: 'target_categories',
      availableIn: ['function'],
      Component: CWColorFilterComponent,
      initialValue: ALL_COLORS,
      categories: ALL_COLORS,
      mapArgToValue: (blocks) => {
        const lambdaMax = blocks.reduce(
          (lambdaMax, block) => lambdaMax + block.properties.lambdaMaxShift,
          0,
        );
        const color = ALL_COLORS.find((color) => {
          const { min, max } = LambdaMaxRangeForColor[color]!;
          return lambdaMax >= min && lambdaMax <= max;
        });
        return color ? [color] : [];
      },
    },
  ];

  moleculeSize = 3;

  constructor(private http: HttpClient) {
    super();
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token',
      }),
    };

    this.http
      .get<ColorWheelBlockSetJSON>(ASSET_URL, httpOptions)
      .subscribe((json) => {
        this._json = json;
        this._json.blocks.start.forEach((block) => {
          block.index = 0;
        });
        this._json.blocks.middle.forEach((block) => {
          block.index = 1;
        });
        this._json.blocks.end.forEach((block) => {
          block.index = 2;
        });
        this.resolveSVGDimensions().subscribe(() => {
          this._finalize();
        });
      });
  }

  getBlocksByPosition(i: number): Block[] {
    return [
      this._json.blocks.start,
      this._json.blocks.middle,
      this._json.blocks.end,
    ][i]!;
  }

  private resolveSVGDimensions(): Observable<any> {
    return forkJoin(
      this.getAllBlocks().map((block) =>
        this.http.get(block.svgUrl, { responseType: 'text' }).pipe(
          map(getSVGViewBox),
          tap(([x, y, width, height]) => {
            block.width = width;
            block.height = height;
          }),
        ),
      ),
    );
  }

  filter() {
    // if (this.functionModeEnabled) {
    //   if (!this.blockSet) return [];
    //
    //   const currentMolecule = this.moleculeList[0];
    //
    //   const getBlocksOfType = (type: BlockType) =>
    //     this.blockData?.blocks[type] ?? [];
    //
    //   if (this.colorFilter.length == 0) {
    //     return Object.values(BlockType).flatMap(
    //       (type) => this.blockData?.blocks[type] ?? [],
    //     );
    //   }
    //
    //   const startingLambdaMax = currentMolecule
    //     ? aggregateProperty(currentMolecule, this.blockSet.primaryProperty)
    //     : 0;
    //
    //   const excludedTypes = new Set(
    //     currentMolecule?.blockList.map((block) => block.type) ?? [],
    //   );
    //
    //   const availableTypes = Object.values(BlockType).filter(
    //     (t) => !excludedTypes.has(t),
    //   );
    //
    //   const viableBlocks = Object.fromEntries(
    //     Object.values(BlockType).map((type) => [type, new Set<Block>()]),
    //   );
    //
    //   const enumerate = (
    //     curBlocks: Block[],
    //     accumulatedLambdaMax: number,
    //     remainingTypes: BlockType[],
    //   ) => {
    //     if (!remainingTypes.length) {
    //       if (
    //         this.colorFilter.some((color) => {
    //           const { min, max } = LambdaMaxRangeForColor[color];
    //           return accumulatedLambdaMax >= min && accumulatedLambdaMax <= max;
    //         })
    //       ) {
    //         curBlocks.forEach((block) => viableBlocks[block.type].add(block));
    //       }
    //       return;
    //     }
    //     const [nextType, ...nextRemainingTypes] = remainingTypes;
    //     for (const nextBlock of getBlocksOfType(nextType)) {
    //       enumerate(
    //         [...curBlocks, nextBlock],
    //         accumulatedLambdaMax + nextBlock.properties.lambdaMaxShift,
    //         nextRemainingTypes,
    //       );
    //     }
    //   };
    //
    //   enumerate([], startingLambdaMax, availableTypes);
    //
    //   return [
    //     ...viableBlocks[BlockType.Start],
    //     ...viableBlocks[BlockType.Middle],
    //     ...viableBlocks[BlockType.End],
    //   ];
    // } else {
    //   let blocks: Block[] = [];
    //   const blockTypes = this.typeFilter.length
    //     ? this.typeFilter
    //     : ['start', 'middle', 'end'];
    //   if (this.blockSet) {
    //     blockTypes.forEach((blockType) => {
    //       const blockTypeEnum = this.getKeyByValue(blockType);
    //       if (blockTypeEnum) {
    //         this.blockData?.blocks[blockTypeEnum].forEach((block) => {
    //           if (
    //             this.filteredBlocks.some(
    //               (e) =>
    //                 e === block.properties[this.blockSet!.labelProperty.key],
    //             )
    //           ) {
    //             blocks.push(block);
    //           }
    //         });
    //       }
    //     });
    //   }
    //   return blocks;
    // }
  }
}
