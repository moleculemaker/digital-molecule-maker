import { Component, HostBinding, Input, OnInit } from '@angular/core';
import {
  Block,
  BlockSet,
  FunctionalPropertyDefinition,
  getBlockSetScale,
  Molecule,
} from '../models';
import Fuse from 'fuse.js';
import { WorkspaceService } from '../services/workspace.service';
import { ColorKeyT, LambdaMaxRangeForColor } from '../utils/colors';
import { applyTargetFilter, lookupProperty } from '../lookup';
import { BlockSetId } from '../services/block.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss'],
})
export class AppSidebarComponent implements OnInit {
  labelList: string[] = [];
  fuse!: Fuse<string>;

  @HostBinding('class') sidebarClasses: string = 'expanded';

  _blockSet!: BlockSet;

  @Input()
  get blockSet(): BlockSet {
    return this._blockSet;
  }

  set blockSet(blockSet: BlockSet) {
    if (blockSet) {
      const processBlockArray = (blocks: Block[]) =>
        blocks.forEach((block) => {
          this.labelList.push(
            String(lookupProperty([block], blockSet, blockSet.labelProperty)),
          );
        });
      processBlockArray(blockSet.blocks.flat());
      this.fuse = new Fuse(this.labelList, {
        includeScore: true,
        isCaseSensitive: true,
        ignoreLocation: true,
        shouldSort: true,
      });
      this.filteredBlocks = this.labelList.slice();
      this._blockSet = blockSet;
      this.blockLevelScale = getBlockSetScale(blockSet, 200);
    }
  }

  currentToggle = 'build';
  blockLevelScale = 1;

  filteredBlocks: string[] = [];
  availableBlocks: Block[] = [];

  searchPlaceholder = 'Search';
  moleculeSearch = [
    { chemicalFormula: 'C<sub>15</sub>H<sub>14</sub>BNO<sub>4</sub>S' },
  ]; //array of molecules to search by

  // I. structure mode

  allTypeFilters = ['all', 'start', 'middle', 'end'];
  _typeFilter: string[] = []; //array of types to filter by (only used in showing the blocks?)

  get typeFilter() {
    return this._typeFilter;
  }

  set typeFilter(typeFilter) {
    this._typeFilter = typeFilter;
    this.applyFilters();
  }

  // II. function mode (color wheel)

  _colorFilter: ColorKeyT[] = [];

  get colorFilter() {
    return this._colorFilter;
  }

  set colorFilter(colorFilter) {
    this._colorFilter = colorFilter;
    this.applyFilters();
  }

  labelForColor(key: ColorKeyT) {
    return LambdaMaxRangeForColor[key].name;
  }

  // III. function mode (OPV)

  xAxis!: FunctionalPropertyDefinition;
  yAxis!: FunctionalPropertyDefinition;
  _xRange!: [number, number];
  _yRange!: [number, number];

  get xRange() {
    return this._xRange;
  }

  set xRange(xRange) {
    this._xRange = xRange;
    this.applyFilters();
  }

  get yRange() {
    return this._yRange;
  }

  set yRange(yRange) {
    this._yRange = yRange;
    this.applyFilters();
  }

  isSidebarExpanded = true;

  molecule: Molecule | null = null;
  functionModeEnabled = true;

  currentTab: 'blocks' | 'details' = 'blocks';

  constructor(private workspaceService: WorkspaceService) {
    combineLatest([
      this.workspaceService.selectedMolecule$,
      this.workspaceService.selectedBlock$,
    ]).subscribe(([molecule]) => {
      this.currentTab = molecule ? 'details' : 'blocks';
    });
  }

  //********************************************
  ngOnInit(): void {
    this.workspaceService.functionMode$.subscribe((enabled) => {
      this.functionModeEnabled = enabled;
      this.applyFilters();
    });
    this.workspaceService.molecule$.subscribe((molecule) => {
      this.molecule = molecule;
      this.applyFilters();
    });

    this.xAxis = this.blockSet.functionalProperties[0]!;
    this.yAxis = this.blockSet.functionalProperties[1]!;
    this._xRange = [this.xAxis.min, this.xAxis.max];
    this._yRange = [this.yAxis.min, this.yAxis.max];
    this.applyFilters();
  }

  //********************************************
  getSearchPlaceholder(): string {
    return this.moleculeSearch.length == 0 ? this.searchPlaceholder : '';
  }

  //********************************************
  toggleSidebar(override?: boolean) {
    this.isSidebarExpanded =
      typeof override != 'undefined' ? override : !this.isSidebarExpanded;
    this.sidebarClasses = this.isSidebarExpanded ? 'expanded' : 'collapsed';
  }

  //********************************************
  onClickType(type: string) {
    if (type == 'all') {
      this.typeFilter = [];
    } else {
      if (this.typeFilter.includes(type)) {
        let index = this.typeFilter.indexOf(type);
        this.typeFilter = [
          ...this.typeFilter.slice(0, index),
          ...this.typeFilter.slice(index + 1),
        ];
      } else {
        this.typeFilter = [...this.typeFilter, type];
      }
    }
  }

  onClickColorType(type: ColorKeyT) {
    if (this.colorFilter.includes(type)) {
      let index = this.colorFilter.indexOf(type);
      this.colorFilter = [
        ...this.colorFilter.slice(0, index),
        ...this.colorFilter.slice(index + 1),
      ];
    } else {
      this.colorFilter = [...this.colorFilter, type];
    }
  }

  private applyFilters() {
    if (this.functionModeEnabled) {
      if (this.blockSet?.id === BlockSetId.ColorWheel) {
        this.applyColorFilters();
      } else if (this.blockSet?.id === BlockSetId.OPV) {
        this.applyOPVFilters();
      }
    } else {
      this.applyTypeFilters();
    }
  }

  private applyTypeFilters() {
    let blocks: Block[] = [];
    const blockTypes = this.typeFilter.length
      ? this.typeFilter
      : ['start', 'middle', 'end'];
    blockTypes.forEach((blockType) => {
      this.blockSet.blocks
        .flat()
        ?.filter((block) => {
          if (block.index === 0) {
            return blockType === 'start';
          } else if (block.index === this.blockSet.moleculeSize - 1) {
            return blockType === 'end';
          } else {
            return blockType === 'middle';
          }
        })
        ?.forEach((block) => {
          if (
            this.filteredBlocks.some(
              (e) =>
                e ===
                lookupProperty(
                  [block],
                  this.blockSet,
                  this.blockSet.labelProperty,
                ),
            )
          ) {
            blocks.push(block);
          }
        });
    });
    this.availableBlocks = blocks;
  }

  private applyColorFilters() {
    this.availableBlocks = applyTargetFilter(
      {
        select: [this.blockSet.functionalProperties[0]!],
        accept: ([lambdaMax]) => {
          return (
            !this.colorFilter.length ||
            this.colorFilter.some((color) => {
              const { min, max } = LambdaMaxRangeForColor[color];
              return lambdaMax! >= min && lambdaMax! <= max;
            })
          );
        },
      },
      this.molecule?.blockList ?? [],
      this.blockSet,
    );
  }

  private applyOPVFilters() {
    this.availableBlocks = applyTargetFilter(
      {
        select: [
          this.blockSet.functionalProperties[0]!,
          this.blockSet.functionalProperties[1]!,
        ],
        accept: ([so, t80]) => {
          return (
            so! >= this.xRange[0] &&
            so! <= this.xRange[1] &&
            t80! >= this.yRange[0] &&
            t80! <= this.yRange[1]
          );
        },
      },
      this.molecule?.blockList ?? [],
      this.blockSet,
    );
  }

  //********************************************
  removeMoleculeFromSearch(molecule: any) {
    //todo: remove the specific molecule from the search, for now, just clear off the last one
    this.moleculeSearch.pop();
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

  selectMolecule() {
    const molecule = this.workspaceService.molecule$.value;
    if (molecule) {
      this.workspaceService.selectedMolecule$.next(molecule);
      this.workspaceService.selectedBlock$.next(null);
    }
  }

  resetSelection() {
    this.workspaceService.selectedMolecule$.next(null);
    this.workspaceService.selectedBlock$.next(null);
  }

  lookupProperty = lookupProperty;
}
