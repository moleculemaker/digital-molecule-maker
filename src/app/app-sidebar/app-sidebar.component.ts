import {Component, HostBinding, Input, OnInit} from '@angular/core';
import {BlockSize} from '../block/block.component';
import {Block, BlockSet, BlockType, getBlockSetScale, Molecule,} from '../models';
import Fuse from 'fuse.js';
import {animate, state, style, transition, trigger,} from '@angular/animations';
import {Filter, WorkspaceService} from '../services/workspace.service';
import {ColorKeyT, LambdaMaxRangeForColor} from '../utils/colors';
import {map} from 'rxjs/operators';
import {dftX, dftY} from "../utils/dft";

const toValue = map((e: InputEvent) => +(e.target as HTMLInputElement).value);

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss'],
  animations: [
    trigger('filtersExpand', [
      state('collapsed', style({height: '0px'})),
      state('expanded', style({height: '*'})),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ),
    ]),
  ],
})
export class AppSidebarComponent implements OnInit {
  labelList: string[] = [];
  fuse!: Fuse<string>;

  @HostBinding('class') sidebarClasses: string = 'expanded';

  @Input()
  get blockSet(): BlockSet | null {
    return this.blockData;
  }

  set blockSet(blockSet: BlockSet | null) {
    if (blockSet) {
      const processBlockArray = (blocks: Block[]) =>
        blocks.forEach((block) => {
          this.labelList.push(block.properties[blockSet.labelProperty.key]);
        });
      processBlockArray(blockSet.blocks[BlockType.Start]);
      processBlockArray(blockSet.blocks[BlockType.Middle]);
      processBlockArray(blockSet.blocks[BlockType.End]);
      this.fuse = new Fuse(this.labelList, {
        includeScore: true,
        isCaseSensitive: true,
        ignoreLocation: true,
        shouldSort: true,
      });
      this.filteredBlocks = this.labelList.slice();
      this.blockData = blockSet;
      this.blockLevelScale = getBlockSetScale(blockSet, 200);
    }
  }

  @Input()
  currentBlockType = BlockType.Start;
  //  currentBlockType:String = 'start'; //todo: need to change this to different structure like selecting the actual tab data instead of just the index

  currentToggle = 'build';
  BlockSize = BlockSize; // for use in template
  blockLevelScale = 1;

  blockData: BlockSet | null = null;
  filteredBlocks: string[] = [];

  searchPlaceholder = 'Search';
  moleculeSearch = [
    {chemicalFormula: 'C<sub>15</sub>H<sub>14</sub>BNO<sub>4</sub>S'},
  ]; //array of molecules to search by

  typeFilter: string[] = []; //array of types to filter by (only used in showing the blocks?)
  allTypeFilters = ['all', 'start', 'middle', 'end'];

  colorFilter: ColorKeyT[] = [];

  labelForColor(key: ColorKeyT) {
    return LambdaMaxRangeForColor[key].name;
  }

  isSidebarExpanded = true;
  isShowingFilters = false;

  moleculeList: Molecule[] = [];
  functionModeEnabled = true;
  filters: Filter[] = [];

  constructor(private workspaceService: WorkspaceService) {
    this.workspaceService.functionMode$.subscribe((enabled) => {
      this.functionModeEnabled = enabled;
    });
    this.workspaceService.moleculeList$.subscribe((moleculeList) => {
      this.moleculeList = moleculeList;
    });
    this.workspaceService.filters$.subscribe((filters) => {
      this.filters = filters;
    });
    const [x1, x2, y1, y2] = this.workspaceService.bounds
    this.xRangeMax = this._xRange = [x1, x2];
    this.yRangeMax = this._yRange = [y1, y2];
  }

  xRangeMax: [number, number] = [0, 0];
  yRangeMax: [number, number] = [0, 0];

  _xRange: [number, number] = [0, 0];
  _yRange: [number, number] = [0, 0];

  get xRange() {
    return this._xRange;
  }

  get yRange() {
    return this._yRange;
  }

  set xRange(v) {
    this._xRange = v;
    this.update();
  }

  set yRange(v) {
    this._yRange = v;
    this.update();
  }

  private update() {
    this.workspaceService.updateFilters([
      (blocks: Block[]) => {
        const x = dftX(blocks);
        const y = dftY(blocks);
        return (
          this.xRange[0] <= x &&
          x <= this.xRange[1] &&
          this.yRange[0] <= y &&
          y <= this.yRange[1]
        );
      },
    ]);
  }

  //********************************************
  ngOnInit(): void {
  }

  //********************************************
  onChangeToggle(newToggle: string) {
    this.currentToggle = newToggle;
  }

  //********************************************
  getSearchPlaceholder(): string {
    return this.moleculeSearch.length == 0 ? this.searchPlaceholder : '';
  }


  //********************************************
  getBlockData(): Block[] {
    if (this.functionModeEnabled) {
      if (!this.blockSet) return [];

      const currentMolecule = this.moleculeList[0];

      const getBlocksOfType = (type: BlockType) =>
        this.blockData?.blocks[type] ?? [];

      // if (this.colorFilter.length == 0) {
      //   return Object.values(BlockType).flatMap(
      //     (type) => this.blockData?.blocks[type] ?? [],
      //   );
      // }

      // const startingLambdaMax = currentMolecule
      //   ? aggregateProperty(currentMolecule, this.blockSet.primaryProperty)
      //   : 0;
      const initialBlocks = currentMolecule?.blockList ?? [];

      const excludedTypes = new Set(
        currentMolecule?.blockList.map((block) => block.type) ?? [],
      );

      const availableTypes = Object.values(BlockType).filter(
        (t) => !excludedTypes.has(t),
      );

      const viableBlocks = Object.fromEntries(
        Object.values(BlockType).map((type) => [type, new Set<Block>()]),
      );

      const enumerate = (curBlocks: Block[], remainingTypes: BlockType[]) => {
        if (!remainingTypes.length) {
          if (
            // this.colorFilter.some((color) => {
            //   const { min, max } = LambdaMaxRangeForColor[color];
            //   return accumulatedLambdaMax >= min && accumulatedLambdaMax <= max;
            // })
            this.filters.every((filter) => filter(curBlocks))
          ) {
            curBlocks.forEach((block) => {
              if (!excludedTypes.has(block.type)) {
                viableBlocks[block.type].add(block);
              }
            });
          }
          return;
        }
        const [nextType, ...nextRemainingTypes] = remainingTypes;
        for (const nextBlock of getBlocksOfType(nextType)) {
          enumerate([...curBlocks, nextBlock], nextRemainingTypes);
        }
      };

      enumerate(initialBlocks, availableTypes);

      return [
        ...viableBlocks[BlockType.Start],
        ...viableBlocks[BlockType.Middle],
        ...viableBlocks[BlockType.End],
      ];
    } else {
      let blocks: Block[] = [];
      const blockTypes = this.typeFilter.length
        ? this.typeFilter
        : ['start', 'middle', 'end'];
      if (this.blockSet) {
        blockTypes.forEach((blockType) => {
          const blockTypeEnum = this.getKeyByValue(blockType);
          if (blockTypeEnum) {
            this.blockData?.blocks[blockTypeEnum].forEach((block) => {
              if (
                this.filteredBlocks.some(
                  (e) =>
                    e === block.properties[this.blockSet!.labelProperty.key],
                )
              ) {
                blocks.push(block);
              }
            });
          }
        });
      }
      return blocks;
    }
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
  toggleSidebar(override?: boolean) {
    this.isSidebarExpanded =
      typeof override != 'undefined' ? override : !this.isSidebarExpanded;
    this.sidebarClasses = this.isSidebarExpanded ? 'expanded' : 'collapsed';
  }

  //********************************************
  toggleFilters(override?: boolean) {
    this.isShowingFilters =
      typeof override != 'undefined' ? override : !this.isShowingFilters;
  }

  //********************************************
  onClickType(type: string) {
    if (type == 'all') {
      this.typeFilter = [];
    } else {
      if (this.typeFilter.includes(type)) {
        let index = this.typeFilter.indexOf(type);
        this.typeFilter.splice(index, 1);
      } else {
        this.typeFilter.push(type);
      }
    }
  }

  onClickColorType(type: ColorKeyT) {
    if (this.colorFilter.includes(type)) {
      let index = this.colorFilter.indexOf(type);
      this.colorFilter.splice(index, 1);
    } else {
      this.colorFilter.push(type);
    }

    this.workspaceService.updateFilters([
      (blocks: Block[]) => {
        const accumulatedLambdaMax = blocks.reduce(
          (lambda, blocks) => lambda + blocks.properties.lambdaMaxShift,
          0,
        );
        return this.colorFilter.some((color) => {
          const {min, max} = LambdaMaxRangeForColor[color];
          return accumulatedLambdaMax >= min && accumulatedLambdaMax <= max;
        });
      },
    ]);
  }

  toggle() {
    this.workspaceService.toggle();
  }

  //********************************************
  removeMoleculeFromSearch(molecule: any) {
    //todo: remove the specific molecule from the search, for now, just clear off the last one
    this.moleculeSearch.pop();
  }

  getKeyByValue(value: string) {
    const indexOfS = Object.values(BlockType).indexOf(
      value as unknown as BlockType,
    );
    const key = Object.keys(BlockType)[indexOfS];
    const enumKey: BlockType = (<any>BlockType)[key];
    return enumKey;
  }

  searchBlock(event: any) {
    try {
      this.filteredBlocks.length = 0;
      if (event.target.value == '') {
        this.labelList.forEach((e) => {
          // this.filteredBlocks.push(e.replace(/(\d+)/g, '<sub>$1</sub>'));
          this.filteredBlocks.push(e);
        });
        return;
      }
      const results = this.fuse.search(event.target.value);
      results.forEach((result) => {
        // this.filteredBlocks.push(
        //   result.item.replace(/(\d+)/g, '<sub>$1</sub>'),
        // );
        this.filteredBlocks.push(result.item);
      });
    } catch (error) {
      console.log(error);
    }
  }
}
