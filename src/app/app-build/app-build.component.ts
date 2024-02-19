import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { Block, BlockSet, Coordinates, TargetFilter } from '../models';

import { BlockService } from '../services/block.service';
import { DroppableEvent } from '../drag-drop-utilities/droppable/droppable.service';
import { WorkspaceService } from '../services/workspace.service';
import { CartService } from '../services/cart.service';
import {
  BLOCK_HEIGHT,
  BLOCK_PADDING_X,
  BLOCK_WIDTH,
} from '../block-svg/block-svg.component';

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

  blockSet: BlockSet | null = null;

  zoomAndPanMatrix = [1, 0, 0, 1, 0, 0];

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
    private blockService: BlockService,
    private workspaceService: WorkspaceService,
    private cartService: CartService,
  ) {}

  get workspaceMoleculeList() {
    return this.workspaceService.moleculeList;
  }

  get cartMoleculeList() {
    return this.cartService.moleculeList;
  }

  //********************************************
  ngOnInit(): void {
    // WorkspaceService will check for data from a previous session and, if found,
    // will provide us with the restored moleculeList
    // TODO: eventually, might want to ask the user whether to restore, especially
    // if a restored value arrives after the user has begun populating a fresh
    // moleculeList in the current session (which becomes a more interesting case
    // once sessions are persisted on the backend instead of in localStorage)

    this.blockService.blockSet$
      .pipe(untilDestroyed(this))
      .subscribe((blockSet) => {
        this.blockSet = blockSet;
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

    // TODO: Remove this
    this.getOutcomeFeedbackStream().subscribe(console.debug);
  }

  // TODO: Move this method to the scatter plot component
  getOutcomeFeedbackStream() {
    return combineLatest([
      this.workspaceService.filterChange$,
      this.workspaceService.moleculeList$,
    ]).pipe(
      map(([_, moleculeList]) => {
        const blockSet = this.blockService.blockSet!;
        const targetFilters = this.workspaceService.filters.filter(
          (f): f is TargetFilter =>
            f.type === 'target_range' || f.type === 'target_categories',
        );
        const activeMolecule = moleculeList[0];
        const startingFrom = activeMolecule
          ? activeMolecule.blockList
          : Array(blockSet.moleculeSize).fill(null);

        return this.blockService.blockSet!.getAllOutcomes(
          startingFrom,
          targetFilters,
        );
      }),
    );
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

  dropped(event: DroppableEvent<Block>): void {
    const block = event.data;
    if (this.hoveredMolecule != undefined) {
      this.workspaceService.placeBlock(
        this.hoveredMolecule,
        block.index,
        block,
      );
    } else {
      const pos = this.getMousePosition(event.nativeEvent);
      const { x, y } = this.invertTransforms(pos.x, pos.y);
      this.workspaceService.placeInitialBlock(
        new Coordinates(
          x - block.index * (BLOCK_WIDTH + BLOCK_PADDING_X),
          y - BLOCK_HEIGHT / 2,
        ),
        block,
      );
    }
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

        this.workspaceService.updateMoleculePosition(moleculeIndex, dx, dy);
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

  onRemoveBlock(moleculeId: number, blockId: number) {
    const moleculeAlsoRemoved = this.workspaceService.removeBlock(
      moleculeId,
      blockId,
    );
    if (moleculeAlsoRemoved) {
      this.hoveredMolecule = undefined;
    }
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

      this.workspaceService.updateMoleculePosition(
        this.draggedMoleculeIndex,
        dx,
        dy,
      );

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

  addMoleculeToCart(moleculeWorkspaceId: number) {
    const molecule = this.workspaceService.removeMolecule(moleculeWorkspaceId);
    if (molecule) {
      this.cartService.add(molecule);
    }
    this.closeOverlay.next();
  }
}
