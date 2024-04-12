import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  Block,
  Coordinates,
  getBlockSetScale,
  Molecule,
  RigJob,
} from '../models';

import { BlockService, BlockSetId } from '../services/block.service';
import { DroppableEvent } from '../drag-drop-utilities/droppable/droppable.service';
import { RigService } from '../services/rig.service';
import { WorkspaceService } from '../services/workspace.service';
import { CartService } from '../services/cart.service';

@UntilDestroy()
@Component({
  selector: 'app-build',
  templateUrl: './app-build.component.html',
  styleUrls: ['./app-build.component.scss'],
})
export class AppBuildComponent implements OnInit {
  @ViewChild('workspace') svgWorkspace: ElementRef<SVGGraphicsElement> | null =
    null;

  isShowingSendToLab = false;
  isShowingCart = false;

  svgScale = 1;

  zoomAndPanMatrix = [1, 0, 0, 1, 0, 0];

  moleculeList: Molecule[] = [];

  hoveredMolecule?: number = undefined;
  spacebarPressed = false;

  panning = false;
  private _initialPosition!: { x: number; y: number };
  private _panElement!: HTMLElement;
  closeOverlay: Subject<void> = new Subject<void>();
  isDragging: boolean | undefined;
  startingMousePosition: { x: number; y: number } = { x: 0, y: 0 };
  draggedMoleculeIndex: number | undefined;

  constructor(
    private rigService: RigService,
    private workspaceService: WorkspaceService,
    private cartService: CartService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      const groupId = Number(paramMap.get('groupId'));
      const blockSetId = paramMap.get('blockSetId') as BlockSetId;
      this.cartService.reset(groupId, blockSetId);
      this.workspaceService.updateMoleculeList([]);
    });
    this.cartService.blockSet$.subscribe((blockSet) => {
      if (blockSet) {
        this.svgScale = getBlockSetScale(blockSet, 70);
      }
    });
  }

  get blockSet() {
    return this.cartService.blockSet$.value;
  }

  //********************************************
  ngOnInit(): void {
    this.workspaceService
      .getMoleculeList()
      .pipe(
        untilDestroyed(this),
        filter((moleculeList) => !!moleculeList),
      )
      .subscribe((moleculeList) => {
        this.moleculeList = moleculeList;
        this.changeDetector.detectChanges();
      });

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        this.spacebarPressed = true;
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.code === 'Space') {
        this.spacebarPressed = false;
      }
    });

    document.addEventListener('mouseup', (event) => this.onMoveStop(event));
  }

  get personalCart$() {
    return this.cartService.personalCart$;
  }

  //********************************************
  toggleCartPanel(): void {
    this.isShowingCart = !this.isShowingCart;
  }

  //********************************************
  onPanelClose(): void {
    this.toggleCartPanel();
  }

  //********************************************
  toggleSendToLabModal(): void {
    this.isShowingSendToLab = !this.isShowingSendToLab;
  }

  //********************************************
  sendToLab(moleculeList: Molecule[]): void {
    const rigJobs: RigJob[] = [];

    moleculeList.forEach((molecule) => {
      const rigJob: RigJob = {
        block_set_id: this.blockSet!.id,
        block_ids: [
          molecule.blockList[0]!.id,
          molecule.blockList[1]!.id,
          molecule.blockList[2]!.id,
        ],
        molecule_name: molecule.label,
      };

      rigJobs.push(rigJob);
    });

    this.rigService.submitReactions(rigJobs).subscribe((resp) => {
      console.log('Submitted molecules in Cart', resp);
    });
  }

  onZoomIn(): void {
    this.zoomAndPanMatrix = this.zoomAndPanMatrix.map((val) => val * 1.1);
  }

  onZoomOut(): void {
    this.zoomAndPanMatrix = this.zoomAndPanMatrix.map((val) => val * 0.9);
  }

  onCenter(): void {
    this.zoomAndPanMatrix[4] = 0;
    this.zoomAndPanMatrix[5] = 0;
  }

  /**
   * Invert transforms to recover block-set coordinates from on-screen coordinates:
   * 1. Undo `zoomAndPanMatrix`
   * 2. Subtract the top left corner `(-originX, -originY)`.
   * @param x on-screen x coordinate (in SVG user units)
   * @param y on-screen y coordinate (in SVG user units)
   */
  private invertTransforms(x: number, y: number): Coordinates {
    const svgElement = this.svgWorkspace!.nativeElement;
    const rect = svgElement.getBoundingClientRect();
    const CTM = svgElement.getScreenCTM()!;
    // When inverting the transforms, the origin must be placed at the center
    // because of the CSS declaration `transform-origin: 50% 50%`
    const originX = (0.5 * rect.width) / CTM.a;
    const originY = (0.5 * rect.height) / CTM.d;
    const xAfterTransform = x - originX;
    const yAfterTransform = y - originY;
    return new Coordinates(
      (xAfterTransform - this.zoomAndPanMatrix[4]!) /
        this.zoomAndPanMatrix[0]! +
        originX,
      (yAfterTransform - this.zoomAndPanMatrix[5]!) /
        this.zoomAndPanMatrix[3]! +
        originY,
    );
  }

  dropped(event: DroppableEvent): void {
    if (this.hoveredMolecule != undefined) {
      this.moleculeList[this.hoveredMolecule]!.blockList = this.moleculeList[
        this.hoveredMolecule
      ]!.blockList.filter((block) => block.index != event.data.index);
      this.moleculeList[this.hoveredMolecule]!.blockList.push(event.data);
    } else {
      // if (event.data.type == BlockType.Start) {
      const newBlockList: Block[] = [event.data];
      const pos = this.getMousePosition(event.nativeEvent);
      const { x, y } = this.invertTransforms(pos.x, pos.y);
      const positionCoordinates = new Coordinates(x, y);
      const newMolecule = new Molecule(positionCoordinates, newBlockList);
      this.moleculeList.push(newMolecule);
      // }
    }
    // todo: clean up state management a bit; currently modifying the object in place, passing the
    // object to the service, and then subscribing to the service for updates
    this.workspaceService.updateMoleculeList(this.moleculeList);
    this.changeDetector.detectChanges();
    this.closeOverlay.next();
  }

  onMouseEnter(moleculeId: number) {
    this.hoveredMolecule = moleculeId;
  }

  onMouseLeave() {
    this.hoveredMolecule = undefined;
  }

  onPanStart(event: MouseEvent) {
    this.closeOverlay.next();

    if (this.spacebarPressed) {
      this.panning = true;
      this._panElement = event.target as HTMLElement;
      this.closeOverlay.next();

      this._initialPosition = {
        x: event.pageX - this.zoomAndPanMatrix[4]!,
        y: event.pageY - this.zoomAndPanMatrix[5]!,
      };
    }
  }

  onPan(event: MouseEvent) {
    if (this.panning && this.spacebarPressed) {
      let dx = event.pageX - this._initialPosition.x;
      let dy = event.pageY - this._initialPosition.y;

      this.zoomAndPanMatrix[4] = dx;
      this.zoomAndPanMatrix[5] = dy;
    } else {
      // Original code for single molecule movement
      const moleculeIndex = this.hoveredMolecule;
      if (
        this.isDragging &&
        typeof moleculeIndex !== 'undefined' &&
        !this.spacebarPressed
      ) {
        const mousePosition = this.getMousePosition(event);
        const dx =
          (mousePosition.x - this.startingMousePosition.x) /
          this.zoomAndPanMatrix[0]!;
        const dy =
          (mousePosition.y - this.startingMousePosition.y) /
          this.zoomAndPanMatrix[3]!;

        this.moleculeList[moleculeIndex]!.position.x += dx;
        this.moleculeList[moleculeIndex]!.position.y += dy;

        this.startingMousePosition = mousePosition;
      }
    }
  }

  onPanStop(event: MouseEvent) {
    this.panning = false;
  }

  onRemoveMolecule(moleculeId: number) {
    this.hoveredMolecule = undefined;
    this.workspaceService.removeMolecule(moleculeId);
  }

  onRemoveBlock(moleculeId: number, blockIndex: number) {
    this.hoveredMolecule = undefined;
    this.workspaceService.removeBlock(moleculeId, blockIndex);
  }

  closeMoleculePopup() {
    this.closeOverlay.next();
  }

  onMoveStart(event: MouseEvent, moleculeIndex: number) {
    this.isDragging = true;
    this.draggedMoleculeIndex = moleculeIndex;
    this.startingMousePosition = this.getMousePosition(event);
    this.closeMoleculePopup();
  }

  onMove(event: MouseEvent) {
    if (
      this.isDragging &&
      typeof this.draggedMoleculeIndex !== 'undefined' &&
      !this.spacebarPressed
    ) {
      const mousePosition = this.getMousePosition(event);
      const dx =
        (mousePosition.x - this.startingMousePosition.x) /
        this.zoomAndPanMatrix[0]!;
      const dy =
        (mousePosition.y - this.startingMousePosition.y) /
        this.zoomAndPanMatrix[3]!;

      this.moleculeList[this.draggedMoleculeIndex]!.position.x += dx;
      this.moleculeList[this.draggedMoleculeIndex]!.position.y += dy;

      this.startingMousePosition = mousePosition;
    }
  }

  onMoveStop(event: MouseEvent) {
    if (this.isDragging) {
      this.isDragging = false;
      this.draggedMoleculeIndex = undefined;
    }
  }

  getMousePosition(event: MouseEvent) {
    const CTM = this.svgWorkspace!.nativeElement.getScreenCTM()!;
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  addMoleculeToMyCart(molecule: Molecule) {
    this.closeOverlay.next();
    this.workspaceService.updateMoleculeList(
      this.moleculeList.filter((m) => m !== molecule),
    );
    this.cartService.addToPersonalCart(this.blockSet!, molecule);
  }

  sendBackToWorkspace(molecule: Molecule) {
    this.workspaceService.updateMoleculeList([...this.moleculeList, molecule]);
    this.cartService.removeFromPersonalCart(this.blockSet!, [molecule]);
  }
}
