import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, withLatestFrom } from 'rxjs/operators';

import { Molecule, RigJob, User } from '../models';
import { UserService } from './user.service';
import { RigService } from './rig.service';
import { BlockService } from './block.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  moleculeList$ = new BehaviorSubject<Molecule[]>([]);

  get moleculeList() {
    return this.moleculeList$.value;
  }

  constructor(
    private userService: UserService,
    private blockService: BlockService,
    private rigService: RigService,
  ) {
    this.startAutorestore();
    this.startAutosave();
  }

  add(molecule: Molecule) {
    this.moleculeList$.next([...this.moleculeList, molecule]);
  }

  remove(index: number) {
    const removed = this.moleculeList[index];
    this.moleculeList$.next([
      ...this.moleculeList.slice(0, index),
      ...this.moleculeList.slice(index + 1),
    ]);
    return removed;
  }

  sendToLab() {
    const rigJobs: RigJob[] = [];

    this.moleculeList.forEach((molecule) => {
      const rigJob: RigJob = {
        block_set_id: this.blockService.blockSet!.id,
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

  private startAutorestore(): void {
    this.userService
      .getUser()
      .pipe(filter((user) => !!user))
      .subscribe((user) => {
        const restored = localStorage.getItem(this.getLocalStorageKey(user));
        if (restored) {
          try {
            this.moleculeList$.next(JSON.parse(restored));
          } catch (e: unknown) {
            // JSON.parse throws SyntaxError
            console.error('Failed to restore workspace from localStorage', e);
          }
        }
      });
  }

  private startAutosave(): void {
    this.moleculeList$
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
