import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';

import { Molecule, User } from '../models';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private _functionMode = true;

  moleculeList$ = new BehaviorSubject<Molecule[]>([]);
  functionMode$ = new BehaviorSubject<boolean>(this._functionMode);

  constructor(private userService: UserService) {
    this.startAutorestore();
    this.startAutosave();
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
        filter(([moleculeList, user]) => !!user)
      )
      .subscribe(([moleculeList, user]) => {
        try {
          localStorage.setItem(
            this.getLocalStorageKey(user),
            JSON.stringify(moleculeList)
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
