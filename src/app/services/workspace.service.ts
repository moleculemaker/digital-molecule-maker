import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';
import {
  Block,
  Coordinates,
  Filter,
  Molecule,
  User,
  ViewMode,
} from '../models';
import { UserService } from './user.service';
import { isEmpty, updateAt } from '../utils/Array';
import { BlockService } from './block.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  static initialViewMode: ViewMode = 'function';

  viewMode$ = new BehaviorSubject<ViewMode>(WorkspaceService.initialViewMode);

  moleculeList$ = new BehaviorSubject<Molecule[]>([]);

  filters$ = new BehaviorSubject<Filter[]>([]);

  get moleculeList() {
    return this.moleculeList$.value;
  }

  get filters() {
    return this.filters$.value;
  }

  constructor(
    private userService: UserService,
    private blockService: BlockService,
  ) {
    // Which filters are active depends on both the block set and the view mode
    combineLatest([this.viewMode$, this.blockService.blockSet$]).subscribe(
      ([viewMode, blockSet]) => {
        this.filters$.next(
          blockSet.filterDescriptors
            .filter((descriptor) => descriptor.availableIn.includes(viewMode))
            .map((descriptor) => {
              /**
               * Used `any` because it's hard to communicate to TypeScript that `meta` and `value$` have matching types.
               * For type-checking to work, this statement had to be duplicated for each case in the tagged union.
               */
              return {
                type: descriptor.type,
                meta: descriptor,
                value$: new BehaviorSubject(descriptor.initialValue),
              } as Filter;
            }),
        );
      },
    );

    this.startAutorestore();
    this.startAutosave();
  }

  addMolecule(molecule: Molecule) {
    this.moleculeList$.next([...this.moleculeList, molecule]);
  }

  getMolecule(moleculeIndex: number) {
    return this.moleculeList$.value[moleculeIndex];
  }

  updateMoleculePosition(moleculeIndex: number, dx: number, dy: number) {
    const molecule = this.getMolecule(moleculeIndex);
    if (molecule) {
      const { x, y } = molecule.position;
      this.moleculeList$.next(
        updateAt(this.moleculeList, moleculeIndex, {
          ...molecule,
          position: new Coordinates(x + dx, y + dy),
        }),
      );
    }
  }

  removeMolecule(moleculeIndex: number) {
    const removed = this.getMolecule(moleculeIndex);
    this.moleculeList$.next([
      ...this.moleculeList.slice(0, moleculeIndex),
      ...this.moleculeList.slice(moleculeIndex + 1),
    ]);
    return removed;
  }

  placeInitialBlock(coordinates: Coordinates, initialBlock: Block) {
    const blockList: (Block | null)[] = Array(
      this.blockService.blockSet?.moleculeSize,
    ).fill(null);
    blockList[initialBlock.index] = initialBlock;
    this.moleculeList$.next([
      ...this.moleculeList,
      new Molecule(coordinates, blockList),
    ]);
  }

  placeBlock(moleculeIndex: number, blockIndex: number, block: Block) {
    const molecule = this.getMolecule(moleculeIndex);
    if (molecule) {
      this.moleculeList$.next(
        updateAt(this.moleculeList, moleculeIndex, {
          ...molecule,
          blockList: updateAt(molecule.blockList, blockIndex, block),
        }),
      );
    }
  }

  /**
   * Returns a boolean that indicates whether the containing molecule is also removed,
   * which happens when its `blockList` becomes empty.
   */
  removeBlock(moleculeIndex: number, blockIndex: number) {
    const molecule = this.moleculeList[moleculeIndex];
    if (molecule) {
      const newBlockList = updateAt(molecule.blockList, blockIndex, null);
      if (isEmpty(newBlockList)) {
        this.removeMolecule(moleculeIndex);
        return true;
      } else {
        this.moleculeList$.next(
          updateAt(this.moleculeList, moleculeIndex, {
            ...molecule,
            blockList: newBlockList,
          }),
        );
        return false;
      }
    }
    return false;
  }

  toggle() {
    this.viewMode$.next(
      this.viewMode$.value === 'function' ? 'structure' : 'function',
    );
  }

  updateMoleculeList(list: Molecule[]): void {
    this.moleculeList$.next(list);
  }

  getMoleculeList(): Observable<Molecule[]> {
    return this.moleculeList$.asObservable();
  }

  private startAutorestore(): void {
    this.userService
      .getUser()
      .pipe(filter((user) => !!user))
      .subscribe((user) => {
        const restored = localStorage.getItem(this.getLocalStorageKey(user));
        if (restored) {
          try {
            this.updateMoleculeList(JSON.parse(restored));
          } catch (e: unknown) {
            // JSON.parse throws SyntaxError
            console.error('Failed to restore workspace from localStorage', e);
          }
        }
      });
  }

  private startAutosave(): void {
    this.getMoleculeList()
      .pipe(
        withLatestFrom(this.userService.getUser()),
        filter(([moleculeList, user]) => !!user),
      )
      .subscribe(([moleculeList, user]) => {
        try {
          localStorage.setItem(
            this.getLocalStorageKey(user),
            JSON.stringify(moleculeList),
          );
        } catch (e: unknown) {
          console.error('Failed to save workspace to localStorage', e);
        }
      });
  }

  private getLocalStorageKey(user: User | null): string {
    return 'WORKSPACE_' + user?.surveyCode;
  }
}
