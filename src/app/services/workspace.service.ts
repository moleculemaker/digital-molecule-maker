import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Molecule } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private _functionMode = false;
  functionMode$ = new BehaviorSubject<boolean>(this._functionMode);
  moleculeList$ = new BehaviorSubject<Molecule[]>([]);

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
    const moleculesList = this.moleculeList$.value;
    moleculesList.splice(moleculeId, 1);
    this.moleculeList$.next(moleculesList);
  }

  removeBlock(moleculeId: number, blockIndex: number) {
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
}
