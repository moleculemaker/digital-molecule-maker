import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { RigService } from '../services/rig.service';
import { BlockSize } from '../block/block.component';
import { Block, BlockType, Molecule, Coordinates } from '../models';
import { blockSetIds } from '../services/block.service';
import { DroppableEvent } from '../drag-drop-utilities/droppable/droppable.service';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-build',
  templateUrl: './app-build.component.html',
  styleUrls: ['./app-build.component.scss']
})
export class AppBuildComponent implements OnInit {
  isShowingSendToLab = false;
  isShowingCart = false;

  blockList: Block[] = [];
  maxBlockListQuantity = 3; //controls where start, middle, and end blocks can be added

  currentTab = BlockType.Start;
  BlockSize = BlockSize; // for template

  blockSetId: blockSetIds = 'chem237-spring22';

  zoomAndPanMatrix = [1, 0, 0, 1, 0, 0];

  moleculeList: Molecule[] = [];

  hoveredMolecule?: number = undefined;

  panning = false;
  isInfoPanelOpen = false;
  private _initialPosition!:  { x: number, y: number };
  private _panElement!: HTMLElement;
  closeOverlay: Subject<void> = new Subject<void>();

  constructor(private rigService: RigService, private changeDetector: ChangeDetectorRef) { }

  //********************************************
  ngOnInit(): void {
    //start with a blank block
    this.updateSidebarTab(null);
  }

  //********************************************
  toggleCartPanel(): void {
    this.isShowingCart = !this.isShowingCart;
  }

  //********************************************
  onPanelClose():void {
    this.toggleCartPanel();
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

  blockTypeForIndex(index: number): BlockType {
    let returnVal = BlockType.Middle;
    if (index === 0) {
      returnVal = BlockType.Start;
    } else if (index === this.maxBlockListQuantity - 1) {
      returnVal = BlockType.End;
    }
    return returnVal;
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
    this.closeOverlay.next();

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
