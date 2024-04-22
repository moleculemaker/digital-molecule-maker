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
import { filter } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import {
  Block,
  Coordinates,
  getBlockSetScale,
  Molecule,
  RigJob,
} from '../models';

import { BlockSetId } from '../services/block.service';
import { DroppableEvent } from '../drag-drop-utilities/droppable/droppable.service';
import { RigService } from '../services/rig.service';
import { WorkspaceService } from '../services/workspace.service';
import { CartService } from '../services/cart.service';
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

  moleculeList: Molecule[] = [];

  hoveredMolecule?: number = undefined;

  panning = false;
  private _initialPosition!: { x: number; y: number };
  closeOverlay: Subject<void> = new Subject<void>();

  functionModeEnabled = true;

  constructor(
    private rigService: RigService,
    private workspaceService: WorkspaceService,
    private cartService: CartService,
    private userService: UserService,
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
    this.workspaceService.functionMode$.subscribe((enabled) => {
      this.functionModeEnabled = enabled;
    });
  }

  get blockSet() {
    return this.cartService.blockSet$.value;
  }

  get isGuest() {
    return this.userService.isGuest();
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
  }

  toggle() {
    this.workspaceService.toggle();
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
    if (this.hoveredMolecule != undefined) {
      this.moleculeList[this.hoveredMolecule]!.blockList = this.moleculeList[
        this.hoveredMolecule
      ]!.blockList.filter((block) => block.index != event.data.index);
      this.moleculeList[this.hoveredMolecule]!.blockList.push(event.data);
    } else if (this.moleculeList.length === 0) {
      // disable multi-molecule for now
      const newBlockList: Block[] = [event.data];
      const pos = this.getPointerPosition(event.nativeEvent);
      const { x, y } = this.invertTransforms(pos.x, pos.y);
      const positionCoordinates = new Coordinates(x, y);
      const newMolecule = new Molecule(positionCoordinates, newBlockList);
      this.moleculeList.push(newMolecule);
    }
    // todo: clean up state management a bit; currently modifying the object in place, passing the
    // object to the service, and then subscribing to the service for updates
    this.workspaceService.updateMoleculeList(this.moleculeList);
    this.changeDetector.detectChanges();
    this.closeOverlay.next();
  }

  onPointerEnter(moleculeId: number) {
    this.hoveredMolecule = moleculeId;
  }

  onPointerLeave() {
    this.hoveredMolecule = undefined;
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

  onRemoveMolecule(moleculeId: number) {
    this.hoveredMolecule = undefined;
    this.workspaceService.removeMolecule(moleculeId);
  }

  onRemoveBlock(moleculeId: number, blockIndex: number) {
    this.hoveredMolecule = undefined;
    this.workspaceService.removeBlock(moleculeId, blockIndex);
  }

  getPointerPosition(event: PointerEvent) {
    const CTM = this.svgWorkspace!.nativeElement.getScreenCTM()!;
    return {
      x: (event.clientX - CTM.e) / CTM.a,
      y: (event.clientY - CTM.f) / CTM.d,
    };
  }

  sendBackToWorkspace(molecule: Molecule) {
    this.workspaceService.updateMoleculeList([...this.moleculeList, molecule]);
    this.cartService.removeFromPersonalCart(this.blockSet!, [molecule]);
  }

  resetSelection() {
    this.workspaceService.selectedMolecule$.next(null);
    this.workspaceService.selectedBlock$.next(null);
  }
}
