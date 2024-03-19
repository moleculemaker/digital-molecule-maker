import { Component } from '@angular/core';
import { WorkspaceService } from '../services/workspace.service';
import { BlockSet, Coordinates, Molecule, UserGroup } from '../models';
import { CartService } from '../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'dmm-group-cart',
  templateUrl: './group-cart.component.html',
  styleUrls: ['./group-cart.component.scss'],
})
export class GroupCartComponent {
  molecules: Molecule[] = [];
  group: UserGroup | null = null;
  blockSet: BlockSet | null = null;

  constructor(
    private workspaceService: WorkspaceService,
    private cartService: CartService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      const groupId = Number(paramMap.get('groupId'));
      this.workspaceService.setActiveGroup(groupId);
    });
    combineLatest([
      this.workspaceService.group$,
      this.workspaceService.blockSet$,
    ]).subscribe(([group, blockSet]) => {
      if (group && blockSet) {
        this.group = group;
        this.blockSet = blockSet;
        this.fetchGroupCart(group.id, blockSet);
      }
    });
  }

  fetchGroupCart(groupId: number, blockSet: BlockSet) {
    this.cartService.fetchGroupCart(groupId).subscribe((molecules) => {
      this.molecules = molecules.map(
        (mol) =>
          new Molecule(
            new Coordinates(0, 0),
            mol.block_ids.map((id, index) => blockSet.blocks[index]![id - 1]!),
            mol.name,
          ),
      );
    });
  }

  goBackToWorkspace() {
    this.location.back();
  }
}