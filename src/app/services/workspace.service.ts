import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Block,
  BlockSet,
  fromMoleculeDTO,
  Molecule,
  MoleculeDTO,
  toMoleculeDTO,
  UserGroup,
} from '../models';
import { UserService } from './user.service';
import { EnvironmentService } from './environment.service';
import { BlockService, BlockSetId } from './block.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  blockSet$ = new BehaviorSubject<BlockSet | null>(null);
  group$ = new BehaviorSubject<UserGroup | null>(null);

  private _functionMode = false;
  functionMode$ = new BehaviorSubject<boolean>(this._functionMode);

  moleculeList$ = new BehaviorSubject<Molecule[]>([]);
  selectedMolecule$ = new BehaviorSubject<Molecule | null>(null);
  selectedBlock$ = new BehaviorSubject<Block | null>(null);

  personalCart$ = new BehaviorSubject<Molecule[]>([]);
  groupCart$ = new BehaviorSubject<Molecule[]>([]);

  constructor(
    private userService: UserService,
    private envService: EnvironmentService,
    private blockService: BlockService,
    private http: HttpClient,
  ) {}

  reset(groupId: number | null, blockSetId: BlockSetId | null) {
    this.group$.next(null);
    this.blockSet$.next(null);

    if (groupId) {
      this.userService.getGroupInfo(groupId).subscribe((group) => {
        this.blockService
          .getBlockSet(group.block_set_id)
          .subscribe((blockSet) => {
            this.group$.next(group);
            this.blockSet$.next(blockSet);
            this.fetchPersonalCart(blockSet);
            this.fetchGroupCart(group, blockSet);
          });
      });
    } else if (blockSetId) {
      this.blockService.getBlockSet(blockSetId).subscribe((blockSet) => {
        this.blockSet$.next(blockSet);
        this.fetchPersonalCart(blockSet);
      });
    }

    this.functionMode$.next(false);
    this.moleculeList$.next([]);
    this.selectedBlock$.next(null);
    this.selectedMolecule$.next(null);
  }

  toggle() {
    this.functionMode$.next((this._functionMode = !this._functionMode));
  }

  updateMoleculeList(list: Molecule[]): void {
    this.moleculeList$.next(list);
    const blockSet = this.blockSet$.value;
    const molecule = list[0];
    if (blockSet) {
      this.selectedMolecule$.next(
        molecule?.blockList.length === blockSet.moleculeSize ? molecule : null,
      );
    }
  }

  getMoleculeList(): Observable<Molecule[]> {
    return this.moleculeList$.asObservable();
  }

  removeMolecule(moleculeId: number) {
    const moleculesList = this.moleculeList$.value;
    moleculesList.splice(moleculeId, 1);
    this.updateMoleculeList(moleculesList);
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
    this.updateMoleculeList(moleculesList);
  }

  fetchPersonalCart(blockSet: BlockSet) {
    if (this.userService.isGuest()) return;

    const { hostname } = this.envService.getEnvConfig();
    return this.http
      .get<MoleculeDTO[]>(
        `${hostname}/me/molecules?block_set_id=${blockSet.id}`,
        {
          headers: {
            authorization: `Bearer ${this.userService.user$.value?.access_token}`,
          },
        },
      )
      .pipe(map((molecules) => molecules.map(fromMoleculeDTO(blockSet))))
      .subscribe((molecules) => {
        this.personalCart$.next(molecules);
      });
  }

  addToPersonalCart(blockSet: BlockSet, molecule: Molecule) {
    if (this.userService.isGuest()) return;

    const { hostname } = this.envService.getEnvConfig();
    return this.http
      .post(`${hostname}/me/molecules`, toMoleculeDTO(blockSet)(molecule), {
        headers: {
          authorization: `Bearer ${this.userService.user$.value?.access_token}`,
        },
      })
      .subscribe(() => {
        this.fetchPersonalCart(blockSet);
      });
  }

  removeFromPersonalCart(blockSet: BlockSet, molecules: Molecule[]) {
    if (this.userService.isGuest()) return;

    const { hostname } = this.envService.getEnvConfig();
    return this.http
      .put(
        `${hostname}/me/molecules`,
        {
          op: 'delete',
          ids: molecules.map((m) => m.id),
        },
        {
          headers: {
            authorization: `Bearer ${this.userService.user$.value?.access_token}`,
          },
        },
      )
      .subscribe(() => {
        this.fetchPersonalCart(blockSet);
      });
  }

  fetchGroupCart(group: UserGroup, blockSet: BlockSet) {
    if (this.userService.isGuest()) return;

    const { hostname } = this.envService.getEnvConfig();
    return this.http
      .get<MoleculeDTO[]>(`${hostname}/groups/${group.id}/molecules`, {
        headers: {
          authorization: `Bearer ${this.userService.user$.value?.access_token}`,
        },
      })
      .pipe(map((molecules) => molecules.map(fromMoleculeDTO(blockSet))))
      .subscribe((molecules) => {
        this.groupCart$.next(molecules);
      });
  }

  addMyMoleculesToGroupCart() {
    if (this.userService.isGuest()) return;

    const { hostname } = this.envService.getEnvConfig();
    const group = this.group$.value;
    const blockSet = this.blockSet$.value;
    const molecules = this.personalCart$.value;
    if (!group || !blockSet) return;
    this.http
      .post(
        `${hostname}/groups/${group.id}/molecules`,
        molecules.map(toMoleculeDTO(blockSet)),
        {
          headers: {
            authorization: `Bearer ${this.userService.user$.value?.access_token}`,
          },
        },
      )
      .subscribe(() => {
        this.removeFromPersonalCart(blockSet, molecules);
      });
  }
}
