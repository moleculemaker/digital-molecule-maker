import {
  Component,
  ElementRef,
  HostBinding,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  Block,
  SourceCategoricalFilter,
  SourceRangeFilter,
  TargetCategoricalFilter,
  TargetRangeFilter,
} from 'app/models';
import Fuse from 'fuse.js';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { WorkspaceService } from 'app/dmm/services/workspace.service';
import { map, switchMap } from 'rxjs/operators';
import { BlockService } from 'app/dmm/services/block.service';
import { combineLatest } from 'rxjs';
import { BlockSet, getBlockSetScale } from 'app/block-set';

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

  @ViewChild('tray')
  tray!: ElementRef<HTMLDivElement>;

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

  get targetCategoricalFilters$() {
    return this.workspaceService.filters$.pipe(
      map((filters) =>
        filters.filter(
          (filter): filter is TargetCategoricalFilter =>
            filter.type === 'target_categories',
        ),
      ),
    );
  }

  get targetRangeFilters$() {
    return this.workspaceService.filters$.pipe(
      map((filters) =>
        filters.filter(
          (filter): filter is TargetRangeFilter =>
            filter.type === 'target_range',
        ),
      ),
    );
  }

  //********************************************
  ngOnInit(): void {
    combineLatest([
      this.workspaceService.filterChange$,
      this.workspaceService.moleculeList$,
    ]).subscribe(() => {
      this.tray.nativeElement.scrollTop = 0;
    });
  }

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

  getBlockPrimaryPropertyDisplayString(block: Block) {
    if (!this.blockSet) return '';
    return this.blockSet.getBlockPropertyDisplayString(
      block,
      this.blockSet.primaryProperty,
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
