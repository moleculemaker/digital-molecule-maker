import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';

import { BlockSet, Molecule, User, UserGroup } from '../models';
import { UserService } from './user.service';
import { BlockService, BlockSetId } from './block.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private _functionMode = false;

  group$ = new BehaviorSubject<UserGroup | null>(null);
  blockSet$ = new BehaviorSubject<BlockSet | null>(null);

  moleculeList$ = new BehaviorSubject<Molecule[]>([]);
  functionMode$ = new BehaviorSubject<boolean>(this._functionMode);

  constructor(
    private userService: UserService,
    private blockService: BlockService,
    private router: Router,
  ) {
    // this.startAutorestore();
    // this.startAutosave();
  }

  setActiveBlockSet(blockSetId: BlockSetId) {
    this.blockSet$.next(null);
    this.blockService.getBlockSet(blockSetId).subscribe((blockSet) => {
      this.blockSet$.next(blockSet);
    });
  }

  setActiveGroup(groupId: number) {
    this.group$.next(null);
    this.blockSet$.next(null);
    this.userService.getGroupInfo(groupId).subscribe((group) => {
      this.blockService
        .getBlockSet(group.block_set_id)
        .subscribe((blockSet) => {
          this.group$.next(group);
          this.blockSet$.next(blockSet);
        });
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

  removeMolecule(moleculeId: number) {
    // TODO: should we use immutable data structures
    const moleculesList = this.moleculeList$.value;
    moleculesList.splice(moleculeId, 1);
    this.moleculeList$.next(moleculesList);
  }

  removeBlock(moleculeId: number, blockIndex: number) {
    // TODO: should we use immutable data structures
    const moleculesList = this.moleculeList$.value;
    const molecule = moleculesList[moleculeId]!;
    molecule.blockList = molecule.blockList.filter(
      (block) => block.index !== blockIndex,
    );
    if (!molecule.blockList.length) {
      moleculesList.splice(moleculeId, 1);
    }
    this.moleculeList$.next(moleculesList);
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
