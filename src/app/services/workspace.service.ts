import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, withLatestFrom} from 'rxjs/operators';

import {Block, BlockSet, Bounds, Molecule, User} from '../models';
import {UserService} from './user.service';
import {BlockService, BlockSetId} from './block.service';
import {ActivatedRoute} from '@angular/router';

export type Filter = (blocks: Block[]) => boolean;

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private _functionMode = false;

  moleculeList$ = new BehaviorSubject<Molecule[]>([]);
  functionMode$ = new BehaviorSubject<boolean>(this._functionMode);
  filters$ = new BehaviorSubject<Filter[]>([]);
  blockSet$ = new BehaviorSubject<BlockSet | null>(null);


  constructor(
    private userService: UserService,
    private blockService: BlockService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParamMap.subscribe((queryParamMap) => {
      let blockSetId = BlockSetId.ColorWheel;
      if (
        Object.values(BlockSetId).includes(
          queryParamMap.get('blockSet') as BlockSetId,
        )
      ) {
        blockSetId = queryParamMap.get('blockSet')! as BlockSetId;
      }
      this.setBlockSet(blockSetId);
    });
    this.startAutorestore();
    this.startAutosave();
  }

  setBlockSet(blockSetId: BlockSetId): void {
    this.blockService.getBlockSet(blockSetId).subscribe((blockSet) => {
      this.blockSet$.next(blockSet);
    });
  }

  toggle() {
    this.functionMode$.next((this._functionMode = !this._functionMode));
  }

  updateMoleculeList(list: Molecule[]): void {
    this.moleculeList$.next(list);
  }

  getMoleculeList(): Observable<Molecule[]> {
    return this.moleculeList$.asObservable();
  }

  updateFilters(filters: Filter[]) {
    this.filters$.next(filters);
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
