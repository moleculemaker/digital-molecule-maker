import { Component, HostBinding, Input, OnInit } from '@angular/core';
import {
  Block,
  BlockSet,
  getBlockSetScale,
  SourceCategoricalFilter,
  SourceRangeFilter,
} from '../models';
import Fuse from 'fuse.js';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { WorkspaceService } from '../services/workspace.service';
import { ColorKeyT, LambdaMaxRangeForColor } from '../utils/colors';
import { map } from 'rxjs/operators';
import { BlockService } from '../services/block.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss'],
  animations: [
    trigger('filtersExpand', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
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
      processBlockArray(blockSet.getAllBlocks());
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

  blockLevelScale = 1;

  blockData: BlockSet | null = null;
  filteredBlocks: string[] = [];

  searchPlaceholder = 'Search';
  moleculeSearch = [
    { chemicalFormula: 'C<sub>15</sub>H<sub>14</sub>BNO<sub>4</sub>S' },
  ]; //array of molecules to search by

  typeFilter: string[] = []; //array of types to filter by (only used in showing the blocks?)
  allTypeFilters = ['all', 'start', 'middle', 'end'];

  colorFilter: ColorKeyT[] = [];
  labelForColor(key: ColorKeyT) {
    return LambdaMaxRangeForColor[key].name;
  }

  isSidebarExpanded = true;
  isShowingFilters = false;

  constructor(
    private workspaceService: WorkspaceService,
    private blockService: BlockService,
  ) {}

  get viewMode$() {
    return this.workspaceService.viewMode$;
  }

  get sourceCategoricalFilters$() {
    return this.workspaceService.filters$.pipe(
      map((filters) =>
        filters.filter(
          (filter): filter is SourceCategoricalFilter =>
            filter.type === 'source_categories',
        ),
      ),
    );
  }

  get sourceRangeFilters$() {
    return this.workspaceService.filters$.pipe(
      map((filters) =>
        filters.filter(
          (filter): filter is SourceRangeFilter =>
            filter.type === 'source_range',
        ),
      ),
    );
  }

  //********************************************
  ngOnInit(): void {}

  //********************************************
  getSearchPlaceholder(): string {
    return this.moleculeSearch.length == 0 ? this.searchPlaceholder : '';
  }

  //********************************************
  getBlockData(): Block[] {
    const blockSet = this.blockService.blockSet!;
    if (!blockSet) return [];
    const activeFilters = this.workspaceService.filters;
    const activeMolecule = this.workspaceService.moleculeList[0];
    return blockSet.getAvailableBlocks(
      activeMolecule
        ? activeMolecule.blockList
        : Array(blockSet.moleculeSize).fill(null),
      activeFilters,
    );
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

  onClickColorType(type: ColorKeyT) {
    if (this.colorFilter.includes(type)) {
      let index = this.colorFilter.indexOf(type);
      this.colorFilter.splice(index, 1);
    } else {
      this.colorFilter.push(type);
    }
  }

  toggle() {
    this.workspaceService.toggle();
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
}
