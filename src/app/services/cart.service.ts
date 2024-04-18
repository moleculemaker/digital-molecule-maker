import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  BlockSet,
  fromMoleculeDTO,
  Molecule,
  MoleculeDTO,
  toMoleculeDTO,
  UserGroup,
} from '../models';
import { UserService } from './user.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { BlockService, BlockSetId } from './block.service';
import {WorkspaceService} from "./workspace.service";

@Injectable({
  providedIn: 'root',
})
export class CartService {
  group$ = new BehaviorSubject<UserGroup | null>(null);
  blockSet$ = new BehaviorSubject<BlockSet | null>(null);
  personalCart$ = new BehaviorSubject<Molecule[]>([]);
  groupCart$ = new BehaviorSubject<Molecule[]>([]);

  constructor(
    private userService: UserService,
    private envService: EnvironmentService,
    private blockService: BlockService,
    private workspaceService: WorkspaceService,
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

    this.workspaceService.reset();
  }

  fetchPersonalCart(blockSet: BlockSet) {
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
    const { hostname } = this.envService.getEnvConfig();
    return this.http
      .patch(
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
