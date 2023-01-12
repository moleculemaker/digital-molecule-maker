import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { RigService } from '../services/rig.service';
import { BlockSize } from '../block/block.component';
import { Block, BlockType, Molecule, Coordinates } from '../models';
import { blockSetIds } from '../services/block.service';
import { DroppableEvent } from '../drag-drop-utilities/droppable/droppable.service';

@Component({
  selector: 'app-build',
  templateUrl: './app-build.component.html',
  styleUrls: ['./app-build.component.scss']
})
export class AppBuildComponent implements OnInit {
  isShowingAnalysis = false;
  isShowingSendToLab = false;

  blockList: Block[] = [];
  maxBlockListQuantity = 3; //controls where start, middle, and end blocks can be added

  currentTab = BlockType.Start;
  BlockSize = BlockSize; // for template

  blockSetId: blockSetIds = 'chem237-spring22';

  zoomAndPanMatrix = [1, 0, 0, 1, 0, 0];

  moleculeList: Molecule[] = [];

  hoveredMolecule?: number = undefined;

  panning = false;
  private _initialPosition!:  { x: number, y: number };
  private _panElement!: HTMLElement;

  constructor(private rigService: RigService, private changeDetector: ChangeDetectorRef) { }

  //********************************************
  ngOnInit(): void {
    //start with a blank block
    this.updateBlankBlocks(null);
    this.updateSidebarTab(null);
  }

  //********************************************
  toggleAnalysisPanel(): void {
    this.isShowingAnalysis = !this.isShowingAnalysis;
  }

  //********************************************
  onPanelClose():void {
    this.toggleAnalysisPanel();
  }

  //********************************************
  toggleSendToLabModal(): void {
    this.isShowingSendToLab = !this.isShowingSendToLab;
  }

  //********************************************
  selectTab(newTab: BlockType): void {
    this.currentTab = newTab;
  }

  //********************************************
  addBlock(block: Block, addIndex: number|null): void {
    //todo - allow adding at various points in the array
//    if (typeof addIndex == 'undefined') {addIndex = this.blockList.length;}

//for now, only allow data in the 3 different spots in the array
    if (block.type == BlockType.Start) {
      addIndex = 0;
    } else if (block.type == BlockType.Middle) {
      addIndex = 1;
    } else {
      addIndex = 2;
    }

    //update the current block
    this.blockList[addIndex] = block;

    //if inserted, and not at the end, then add the next block
    this.updateBlankBlocks(addIndex);
    this.updateSidebarTab(addIndex);

    //make sure isShowingAnalysis is closed
    if (this.isShowingAnalysis) {this.toggleAnalysisPanel();}
  }

  blockTypeForIndex(index: number): BlockType {
    let returnVal = BlockType.Middle;
    if (index === 0) {
      returnVal = BlockType.Start;
    } else if (index === this.maxBlockListQuantity - 1) {
      returnVal = BlockType.End;
    }
    return returnVal;
  }
  //********************************************
  updateBlankBlocks(updatedIndex: number|null): void {
    const blankBlock = {
      // note no type field; we'll fill it in below
      id: '',
      label: '',
      svgUrl: '', // other code looks for this value; maybe change representation
      width: 80,
      height: 80
    };
    if (updatedIndex === null) {
      // we have nothing yet; add a blank start block
      this.blockList.push({
        ...blankBlock,
        type: this.blockTypeForIndex(0)
      });
    } else {
      // if there's room for another block to the right, add a blank to the right
      if (updatedIndex < this.maxBlockListQuantity - 1 && this.blockList[updatedIndex + 1] === undefined) {
        this.blockList.push({
          ...blankBlock,
          type: this.blockTypeForIndex(updatedIndex+1)
        });
      }
      // if there are unfilled elements of the array, fill them with blanks
      // (this happens, e.g., if the user adds an end block before adding start or middle blocks)
      if (updatedIndex > 1) {
        for (let i = 0; i < updatedIndex; i++) {
          if (this.blockList[i] === undefined) {
            this.blockList[i] = {
              ...blankBlock,
              type: this.blockTypeForIndex(i)
            };
          }
        }
      }
    }
  }

  updateSidebarTab(updatedIndex: number|null): void {
    // determine which tab should be shown
    let newTab: BlockType;
    // if we're initializing, start with the first tab
    if (updatedIndex === null) {
      newTab = BlockType.Start;
    } else {
      // typically move left to right through the tabs
      if (updatedIndex < this.maxBlockListQuantity - 1) {
        newTab = this.blockTypeForIndex(updatedIndex + 1);
      } else {
        // we're already at the far right
        // if there are blanks to the left, return to the tab corresponding to the first blank
        // otherwise stay on the last tab
        // note blockList should by this point be fully populated
        // with real blocks and/or blank blocks
        const firstBlankIndex = this.blockList.findIndex(block => block.svgUrl === '');
        newTab = firstBlankIndex !== -1 ? this.blockTypeForIndex(firstBlankIndex) : BlockType.End;
      }
    }
    this.selectTab(newTab);
  }

  isReadyForLab(): boolean {
    return this.blockList.length === 3 &&
      this.blockList[0].id.length > 0 &&
      this.blockList[1].id.length > 0 &&
      this.blockList[2].id.length > 0;
  }

  sendToLab(moleculeName: string): void {
    this.rigService.submitReaction(
      this.blockSetId,
      this.blockList[0],
      this.blockList[1],
      this.blockList[2],
      moleculeName
    ).subscribe(nullVal => {
      console.log("submitted");
    });
  }

  onZoomIn(): void {
    this.zoomAndPanMatrix = this.zoomAndPanMatrix.map(val => val * 1.1);
  }
  onZoomOut(): void {
    this.zoomAndPanMatrix = this.zoomAndPanMatrix.map(val => val * 0.9);
  }

  onCenter(): void {
    this.zoomAndPanMatrix[4] = 0;
    this.zoomAndPanMatrix[5] = 0;

  }

  dropped(event: DroppableEvent): void {
    const _dragElement = event.nativeEvent.target as HTMLElement;

    const rect = _dragElement.getBoundingClientRect();

    let relX = event.nativeEvent.clientX - rect.left
    let relY = event.nativeEvent.clientY - rect.top

    if (this.hoveredMolecule != undefined) {
      this.moleculeList[this.hoveredMolecule].blockList = this.moleculeList[this.hoveredMolecule].blockList.filter(block => block.type != event.data.type);
      this.moleculeList[this.hoveredMolecule].blockList.push(event.data);
    } else{
      if (event.data.type == BlockType.Start) {
        const newBlockList: Block[] = [event.data];
        relX /= this.zoomAndPanMatrix[0];
        relY /= this.zoomAndPanMatrix[0];
        relX -= this.zoomAndPanMatrix[4];
        relY -= this.zoomAndPanMatrix[5];
        const positionCoordinates = new Coordinates(relX, relY);
        const newMolecule = new Molecule(positionCoordinates, newBlockList);
        this.moleculeList.push(newMolecule);
      }

    }
    this.changeDetector.detectChanges();
    event.data.selected = true;
  }

  onMouseEnter(moleculeId: number){
    this.hoveredMolecule = moleculeId;
  }

  onMouseLeave(){
    this.hoveredMolecule = undefined;
  }

  onPanStart(event: MouseEvent){
    this.panning = true;
    this._panElement = event.target as HTMLElement;

    event.stopPropagation();

    this._initialPosition = {
      x: event.pageX - this.zoomAndPanMatrix[4],
      y: event.pageY - this.zoomAndPanMatrix[5],
    };
  }

  onPan(event: MouseEvent){
    if (this.panning) {
      let dx = (event.pageX - this._initialPosition.x);
      let dy = (event.pageY - this._initialPosition.y);

      this.zoomAndPanMatrix[4] = dx;
      this.zoomAndPanMatrix[5] = dy;
    }
  }

  onPanStop(event: MouseEvent){
    this.panning = false;
  }
}
