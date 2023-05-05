import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { BlockSize } from '../block/block.component';
import { Block, BlockType, Molecule, Coordinates } from '../models';

import { blockSetIds } from '../services/block.service';
import { DroppableEvent } from '../drag-drop-utilities/droppable/droppable.service';
import { RigService } from '../services/rig.service';
import { WorkspaceService } from '../services/workspace.service';
import { CartService } from '../services/cart.service';

@UntilDestroy()
@Component({
  selector: 'app-build',
  templateUrl: './app-build.component.html',
  styleUrls: ['./app-build.component.scss']
})
export class AppBuildComponent implements OnInit {
  isShowingSendToLab = false;
  isShowingCart = false;

  currentTab = BlockType.Start;
  BlockSize = BlockSize; // for template

  blockSetId: blockSetIds = 'chem237-spring22';

  zoomAndPanMatrix = [1, 0, 0, 1, 0, 0];

  moleculeList: Molecule[] = [];
  cartMoleculeList: Molecule[] = [];

  hoveredMolecule?: number = undefined;
  spacebarPressed = false;

  panning = false;
  isInfoPanelOpen = false;
  private _initialPosition!:  { x: number, y: number };
  private _panElement!: HTMLElement;
  closeOverlay: Subject<void> = new Subject<void>();
  isDragging: boolean | undefined;
  draggedMolecule: any;
  //startingMousePosition?: { x: number; y: number; } = undefined;
  svgWorkspace: any;
  startingMousePosition: { x: number; y: number; } = { x: 0, y: 0 };
  draggedMoleculeIndex: number | undefined;
  constructor(
    private rigService: RigService,
    private workspaceService: WorkspaceService,
    private cartService: CartService,
    private changeDetector: ChangeDetectorRef
  ) { }




  //********************************************
  ngOnInit(): void {
    // WorkspaceService will check for data from a previous session and, if found,
    // will provide us with the restored moleculeList
    // TODO: eventually, might want to ask the user whether to restore, especially
    // if a restored value arrives after the user has begun populating a fresh
    // moleculeList in the current session (which becomes a more interesting case
    // once sessions are persisted on the backend instead of in localStorage)

    this.svgWorkspace = document.querySelector('.svg_workspace');
    this.workspaceService.getMoleculeList().pipe(
      untilDestroyed(this),
      filter(moleculeList => !!moleculeList)
    ).subscribe(moleculeList => {
      this.moleculeList = moleculeList;
      this.changeDetector.detectChanges();
    })

    this.cartService.getMoleculeList().pipe(
      untilDestroyed(this),
      filter(moleculeList => !!moleculeList)
    ).subscribe(moleculeList => {
      this.cartMoleculeList = moleculeList;
      this.changeDetector.detectChanges();
    })

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        this.spacebarPressed = true;
        event.preventDefault();
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.code === 'Space') {
        this.spacebarPressed = false;
        event.preventDefault();
      }
    });
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

  sendToLab(moleculeName: string): void {
    // disabled for now
    // should use a molecule instead of this.blockList[i]
    /*
    this.rigService.submitReaction(
      this.blockSetId,
      this.blockList[0],
      this.blockList[1],
      this.blockList[2],
      moleculeName
    ).subscribe(nullVal => {
      console.log("submitted");
    });
    */
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
    // todo: clean up state management a bit; currently modifying the object in place, passing the
    // object to the service, and then subscribing to the service for updates
    this.workspaceService.updateMoleculeList(this.moleculeList);
    this.changeDetector.detectChanges();
    event.data.selected = true;
    this.closeOverlay.next();
  }

  onMouseEnter(moleculeId: number){
    this.hoveredMolecule = moleculeId;
  }

  onMouseLeave(){
    this.hoveredMolecule = undefined;
  }

  // onPanStart(event: MouseEvent){
  //   this.panning = true;
  //   this._panElement = event.target as HTMLElement;
  //   this.closeOverlay.next();

  //   event.stopPropagation();

  //   this._initialPosition = {
  //     x: event.pageX - this.zoomAndPanMatrix[4],
  //     y: event.pageY - this.zoomAndPanMatrix[5],
  //   };
  // }

  // onPan(event: MouseEvent){
  //   // if (this.panning && this.spacebarPressed) {
  //   //   console.log(this.spacebarPressed);

  //   //   let dx = (event.pageX - this._initialPosition.x);
  //   //   let dy = (event.pageY - this._initialPosition.y);

  //   //   this.zoomAndPanMatrix[4] = dx;
  //   //   this.zoomAndPanMatrix[5] = dy;
  //   // }
  // }

  onPanStart(event: MouseEvent){
    if (this.spacebarPressed) {
      this.panning = true;
      this._panElement = event.target as HTMLElement;
      this.closeOverlay.next();

      event.stopPropagation();

      this._initialPosition = {
        x: event.pageX - this.zoomAndPanMatrix[4],
        y: event.pageY - this.zoomAndPanMatrix[5],
      };
    }
  }
  
  onPan(event: MouseEvent){
    if (this.panning && this.spacebarPressed) {
      let dx = (event.pageX - this._initialPosition.x);
      let dy = (event.pageY - this._initialPosition.y);

      this.zoomAndPanMatrix[4] = dx;
      this.zoomAndPanMatrix[5] = dy;
    } else {
      // Original code for single molecule movement
      const moleculeIndex = this.hoveredMolecule;
      if (this.isDragging && typeof moleculeIndex !== 'undefined' && !this.spacebarPressed) {
        const mousePosition = this.getMousePosition(event);
        const dx = mousePosition.x - this.startingMousePosition.x;
        const dy = mousePosition.y - this.startingMousePosition.y;

        this.moleculeList[moleculeIndex].position.x += dx;
        this.moleculeList[moleculeIndex].position.y += dy;

        this.startingMousePosition = mousePosition;
      }
    }
  }
  

  onPanStop(event: MouseEvent){
    this.panning = false;
  }

  onRemoveMolecule(moleculeId: number){
    this.hoveredMolecule = undefined;
    this.moleculeList.splice(moleculeId, 1);
  }

  onMoveStart(event: MouseEvent, moleculeIndex: number) {
    this.isDragging = true;
    this.draggedMoleculeIndex = moleculeIndex;
    this.startingMousePosition = this.getMousePosition(event);
    this.closeOverlay.next();
  }


  onMove(event: MouseEvent) {
    if (this.isDragging && typeof this.draggedMoleculeIndex !== 'undefined' && !this.spacebarPressed) {
      const mousePosition = this.getMousePosition(event);
      const dx = mousePosition.x - this.startingMousePosition.x;
      const dy = mousePosition.y - this.startingMousePosition.y;

      this.moleculeList[this.draggedMoleculeIndex].position.x += dx;
      this.moleculeList[this.draggedMoleculeIndex].position.y += dy;

      this.startingMousePosition = mousePosition;
    }
  }

  onMoveStop(event: MouseEvent) {
    console.log('Move stop');
    this.isDragging = false;
    this.draggedMoleculeIndex = undefined;
  }


  getMousePosition(event: MouseEvent) {
    const CTM = this.svgWorkspace.getScreenCTM();
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  addMoleculeToCart(moleculeId: number){
    let moleculeToAdd = this.moleculeList.splice(moleculeId, 1);
    this.cartMoleculeList.push(moleculeToAdd[0]);
    this.closeOverlay.next();
    this.workspaceService.updateMoleculeList(this.moleculeList);
    this.cartService.updateMoleculeList(this.cartMoleculeList);
  }

  addToWorkSpace(moleculeIdString: string){
    let moleculeId: number = +moleculeIdString;
    let moleculeToAdd = this.cartMoleculeList.splice(moleculeId, 1);
    this.moleculeList.push(moleculeToAdd[0]);
    this.changeDetector.detectChanges();
    this.workspaceService.updateMoleculeList(this.moleculeList);
    this.cartService.updateMoleculeList(this.cartMoleculeList);
  }

}
