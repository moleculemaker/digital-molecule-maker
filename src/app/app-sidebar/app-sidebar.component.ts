import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { BlockService, blockSetIds } from '../services/block.service';
import { BlockSize } from '../block/block.component';
import { Block, BlockSet, BlockType } from '../models';
import Fuse from 'fuse.js';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss'],
  animations: [
    trigger('filtersExpand', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AppSidebarComponent implements OnInit {
  chemicalFormulaeList:string[] = [];
  fuse!:Fuse<string>;

  @HostBinding('class') sidebarClasses:string = 'expanded';

  @Input()
  get blockSetId(): blockSetIds|null { return this._blockSetId; }
  set blockSetId(blockSetId: blockSetIds|null) {
    this._blockSetId = blockSetId;
    if (blockSetId) {
        this.blockService.getBlockSet(this._blockSetId!).subscribe(response => {
            let startBlocks : Block[] = [], middleBlocks : Block[] = [], endBlocks: Block[] = [];
            response.forEach((block: Block) => {
                 if(block.type == BlockType.Start){
                    startBlocks.push(block);
                 } else if (block.type == BlockType.Middle) {
                     middleBlocks.push(block);
                 } else {
                     endBlocks.push(block);
                 }
                 this.chemicalFormulaeList.push(block.chemicalFormula)
                 block.chemicalFormula = block.chemicalFormula.replace(/(\d+)/g, "<sub>$1</sub>");
            });
            this.fuse = new Fuse(this.chemicalFormulaeList, {includeScore: true})
            this.chemicalFormulaeList.forEach(e => this.filteredBlocks.push(e.replace(/(\d+)/g, "<sub>$1</sub>")))
            const blockSet : BlockSet = {
                 [BlockType.Start]: startBlocks,
                 [BlockType.Middle] : middleBlocks,
                 [BlockType.End] : endBlocks
            };
            this.blockData = blockSet;
         });
    }
  }
  private _blockSetId: blockSetIds|null = null;

  @Input()
  currentBlockType = BlockType.Start;
//  currentBlockType:String = 'start'; //todo: need to change this to different structure like selecting the actual tab data instead of just the index

  @Output()
  onSelectBlock = new EventEmitter<Block>();

  @Output()
  onSelectTab = new EventEmitter<BlockType>();

  currentToggle = 'build';
  BlockSize = BlockSize; // for use in template

  blockData?: BlockSet;
  filteredBlocks: string[] = [];

  searchPlaceholder = 'Search';
  moleculeSearch = [
    {chemicalFormula: 'C<sub>15</sub>H<sub>14</sub>BNO<sub>4</sub>S'}
  ]; //array of molecules to search by

  typeFilter:string[] = []; //array of types to filter by (only used in showing the blocks?)
  allTypeFilters = ['all', 'start', 'middle', 'end'];

  isSidebarExpanded = true;
  isShowingFilters = false;

  constructor(
    private blockService: BlockService
  ) { }

  //********************************************
  ngOnInit(): void {
  }

  //********************************************
  onChangeToggle(newToggle: string) {
    this.currentToggle = newToggle;
  }

  //********************************************
  getSearchPlaceholder():string {
    return (this.moleculeSearch.length == 0) ? this.searchPlaceholder : '';
  }

  //********************************************
  getBlockData(): Block[] {
    const blockTypes = this.typeFilter.length == 0 ? this.allTypeFilters : this.typeFilter;
    let blocks: any[] = [];
    blockTypes.forEach(blockType => {
        const blockTypeEnum = this.getKeyByValue(blockType);
        if(blockTypeEnum && this.blockData){

            this.blockData![blockTypeEnum].forEach(block => {
              if(this.filteredBlocks.filter(e => e === block.chemicalFormula).length > 0)
              blocks.push(block);
            });
        }
    });
    return blocks;
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

  //********************************************
  toggleSidebar(override?:boolean) {
    this.isSidebarExpanded = (typeof override != 'undefined') ? override : !this.isSidebarExpanded;
    this.sidebarClasses = (this.isSidebarExpanded) ? 'expanded' : 'collapsed';
  }

  //********************************************
  toggleFilters(override?:boolean) {
    this.isShowingFilters = (typeof override != 'undefined') ? override : !this.isShowingFilters;
  }

  //********************************************
  onClickType(type:string) {
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

  //********************************************
  removeMoleculeFromSearch(molecule:any) {
    //todo: remove the specific molecule from the search, for now, just clear off the last one
    this.moleculeSearch.pop();
  }

  getKeyByValue(value: string) {
    const indexOfS = Object.values(BlockType).indexOf(value as unknown as BlockType);
    const key = Object.keys(BlockType)[indexOfS];
    const enumKey : BlockType = (<any>BlockType)[key]
    return enumKey;
  }

  searchBlock(event: any) {
    try {
      this.filteredBlocks.length = 0;
      if(event.target.value == ''){
        this.chemicalFormulaeList.forEach(e => this.filteredBlocks.push(e.replace(/(\d+)/g, "<sub>$1</sub>")))
        return
      }
      const results = this.fuse.search(event.target.value);
      results.forEach(result => this.filteredBlocks.push(result.item.replace(/(\d+)/g, "<sub>$1</sub>")));
    } catch (error) {
      console.log(error);
    }

  }
}
