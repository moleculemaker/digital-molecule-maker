import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { BlockService, blockSetIds } from '../services/block.service';
import { BlockSize } from '../block/block.component';
import { Block, BlockSet, BlockType } from '../models';

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
  @HostBinding('class') sidebarClasses:string = 'expanded';

  @Input()
  get blockSetId(): blockSetIds|null { return this._blockSetId; }
  set blockSetId(blockSetId: blockSetIds|null) {
    this._blockSetId = blockSetId;
    if (blockSetId) {
      this.blockData = this.blockService.getBlockSet(this._blockSetId!);
    }
  }
  private _blockSetId: blockSetIds|null = null;

  @Input()
  currentBlockType = BlockType.Start;
//  currentBlockType:String = 'start'; //todo: need to change this to different structure like selecting the actual tab data instead of just the index

  currentToggle = 'build';
  BlockSize = BlockSize; // for use in template

  blockData?: BlockSet;

  searchPlaceholder = 'Search';
  moleculeSearch = [
    {name: 'C<sub>15</sub>H<sub>14</sub>BNO<sub>4</sub>S'}
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
        if(blockTypeEnum){
            this.blockData![blockTypeEnum].forEach(block => blocks.push(block));
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
}
