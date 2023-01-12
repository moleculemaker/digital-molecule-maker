import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlockService, blockSetIds } from '../services/block.service';
import { BlockSize } from '../block/block.component';
import { Block, BlockSet, BlockType } from '../models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit {

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

  @Output()
  onSelectBlock = new EventEmitter<Block>();

  @Output()
  onSelectTab = new EventEmitter<BlockType>();

  currentToggle = 'build';
  BlockSize = BlockSize; // for use in template

  blockData?: BlockSet;

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
  getBlockData(): Block[] {
    return this.blockData![this.currentBlockType];
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
