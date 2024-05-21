import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  Block,
  Coordinates,
  getBlockSetScale,
  Molecule,
} from '../models';

import { BlockSetId } from '../services/block.service';
import { DroppableEvent } from '../drag-drop-utilities/droppable/droppable.service';
import { WorkspaceService } from '../services/workspace.service';
import { UserService } from '../services/user.service';

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

  moleculeInWorkspace: Molecule | null = null;
  hovered = false;

  panning = false;
  private _initialPosition!: { x: number; y: number };
  closeOverlay: Subject<void> = new Subject<void>();

  functionModeEnabled = true;

  constructor(
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  get blockSet() {
    return this.workspaceService.blockSet$.value;
  }

  get isGuest() {
    return this.userService.isGuest();
  }

  //********************************************
  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
      const groupId = Number(paramMap.get('groupId'));
      const blockSetId = paramMap.get('blockSetId') as BlockSetId;
      this.workspaceService.reset(groupId, blockSetId);
      this.workspaceService.clear();
    });
    this.workspaceService.blockSet$.subscribe((blockSet) => {
      if (blockSet) {
        this.svgScale = getBlockSetScale(blockSet, 70);
      }
    });
    this.workspaceService.functionMode$.subscribe((enabled) => {
      this.functionModeEnabled = enabled;
    });
    this.workspaceService.molecule$
      .pipe(untilDestroyed(this))
      .subscribe((molecule) => {
        this.moleculeInWorkspace = molecule;
        this.changeDetector.detectChanges();
      });
  }

  toggle() {
    this.workspaceService.toggle();
  }

  get personalCart$() {
    return this.workspaceService.personalCart$;
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

  scaleBy(factor: number) {
    this.zoomAndPanMatrix = this.zoomAndPanMatrix.map((val) => val * factor);
  }

  onZoomIn(): void {
    this.scaleBy(1.1);
  }

  onZoomOut(): void {
    this.scaleBy(0.9);
  }

  onCenter(): void {
    this.zoomAndPanMatrix = [1, 0, 0, 1, 0, 0];
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
    if (this.hovered) {
      this.moleculeInWorkspace!.blockList =
        this.moleculeInWorkspace!.blockList.filter(
          (block) => block.index != event.data.index,
        );
      this.moleculeInWorkspace!.blockList.push(event.data);
      this.workspaceService.updateMolecule(this.moleculeInWorkspace);
    } else if (!this.moleculeInWorkspace) {
      const newBlockList: Block[] = [event.data];
      const pos = this.getPointerPosition(event.nativeEvent);
      const { x, y } = this.invertTransforms(pos.x, pos.y);
      const positionCoordinates = new Coordinates(x, y);
      this.workspaceService.updateMolecule(
        new Molecule(positionCoordinates, newBlockList),
      );
    }
    this.changeDetector.detectChanges();
    this.closeOverlay.next();
  }

  onPointerEnter() {
    this.hovered = true;
  }

  onPointerLeave() {
    this.hovered = false;
  }

  shiftKeyDown = false;

  @HostListener('document:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Shift') this.shiftKeyDown = true;
  }

  @HostListener('document:keyup', ['$event'])
  onKeyUp(e: KeyboardEvent) {
    if (e.key === 'Shift') this.shiftKeyDown = false;
  }

  pointers: PointerEvent[] = [];
  prevPointerDiff = -1;

  onPointerDown(e: PointerEvent) {
    if (this.pointers.length < 2) {
      this.pointers.push(e);
    }
    if (this.pointers.length === 1) {
      this.onPanStart(e);
    }
  }

  onPointerMove(e: PointerEvent) {
    const i = this.pointers.findIndex((ev) => ev.pointerId === e.pointerId);
    if (i !== -1) this.pointers[i] = e;
    if (
      this.pointers.length === 2 ||
      (this.pointers.length === 1 && this.shiftKeyDown)
    ) {
      this.onPinch();
    } else if (this.pointers.length === 1) {
      this.onPan(e);
    }
  }

  @HostListener('document:pointerup', ['$event'])
  onPointerUp(e: PointerEvent) {
    const i = this.pointers.findIndex((ev) => ev.pointerId === e.pointerId);
    if (i !== -1) {
      this.pointers.splice(i, 1);
    }
    if (this.pointers.length < 2) {
      this.onPinchStop();
    }
    if (this.panning) {
      this.onPanStop(e);
    }
  }

  onPinch() {
    let pointerDiff = 0;
    if (this.pointers.length === 2) {
      const [e1, e2] = this.pointers as [PointerEvent, PointerEvent];
      pointerDiff = Math.sqrt(
        (e1.clientX - e2.clientX) ** 2 + (e1.clientY - e2.clientY) ** 2,
      );
    } else if (this.pointers.length === 1 && this.shiftKeyDown) {
      const e = this.pointers[0]!;
      pointerDiff = Math.sqrt(
        (e.clientX - window.innerWidth / 2) ** 2 +
          (e.clientY - window.innerHeight / 2) ** 2,
      );
    }
    if (this.prevPointerDiff > 0) {
      this.scaleBy(1 + (pointerDiff - this.prevPointerDiff) / 30);
    }
    this.prevPointerDiff = pointerDiff;
  }

  onPinchStop() {
    this.prevPointerDiff = -1;
  }

  onPanStart(event: PointerEvent) {
    this.closeOverlay.next();

    this.panning = true;
    this.closeOverlay.next();

    this._initialPosition = {
      x: event.pageX - this.zoomAndPanMatrix[4]!,
      y: event.pageY - this.zoomAndPanMatrix[5]!,
    };
  }

  onPan(event: PointerEvent) {
    if (this.panning) {
      let dx = event.pageX - this._initialPosition.x;
      let dy = event.pageY - this._initialPosition.y;

      this.zoomAndPanMatrix[4] = dx;
      this.zoomAndPanMatrix[5] = dy;
    }
  }

  onPanStop(event: PointerEvent) {
    this.panning = false;
  }

  onRemoveMolecule() {
    this.hovered = false;
    this.workspaceService.clear();
  }

  onRemoveBlock(blockIndex: number) {
    this.hovered = false;
    this.workspaceService.removeBlock(blockIndex);
  }

  getPointerPosition(event: PointerEvent) {
    const CTM = this.svgWorkspace!.nativeElement.getScreenCTM()!;
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  sendBackToWorkspace(molecule: Molecule) {
    this.workspaceService.updateMolecule(molecule);
    this.workspaceService.removeFromPersonalCart(molecule);
  }

  resetSelection() {
    this.workspaceService.selectedMolecule$.next(null);
    this.workspaceService.selectedBlock$.next(null);
  }
}
