import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, tap, withLatestFrom } from 'rxjs/operators';

import { Molecule, User } from '../models';
import { UserService } from './user.service';
import { WorkspaceService } from './workspace.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { BlockSetId } from './block.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  moleculeList$ = new BehaviorSubject<Molecule[]>([]);

  constructor(
    private userService: UserService,
    private workspaceService: WorkspaceService,
    private envService: EnvironmentService,
    private http: HttpClient,
  ) {
    // this.startAutorestore();
    // this.startAutosave();
  }

  updateMoleculeList(list: Molecule[]): void {
    this.moleculeList$.next(list);
  }

  getMoleculeList(): Observable<Molecule[]> {
    return this.moleculeList$.asObservable();
  }

  fetchGroupCart(groupId: number) {
    const { hostname } = this.envService.getEnvConfig();
    return this.http.get<
      Array<{
        name: string;
        block_set_id: BlockSetId;
        block_ids: number[];
      }>
    >(`${hostname}/groups/${groupId}/molecules`, {
      headers: {
        authorization: `Bearer ${this.userService.user$.value?.access_token}`,
      },
    });
  }

  addToGroupCart() {
    const { hostname } = this.envService.getEnvConfig();
    const group = this.workspaceService.group$.value!;
    const data = this.moleculeList$.value.map((molecule) => ({
      name: molecule.label,
      block_set_id: group.block_set_id,
      block_ids: molecule.blockList
        .sort((a, b) => a.index - b.index)
        .map((mol) => mol.id),
    }));
    return this.http
      .post(`${hostname}/groups/${group.id}/molecules`, data, {
        headers: {
          authorization: `Bearer ${this.userService.user$.value?.access_token}`,
        },
      })
      .pipe(tap(() => this.moleculeList$.next([])));
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
    return 'CART_' + user?.surveyCode;
  }
}
