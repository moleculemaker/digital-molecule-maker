import { Component } from '@angular/core';
import { Molecule } from '../models';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { lookupProperty } from '../lookup';
import { BlockSetId } from '../services/block.service';
import {WorkspaceService} from "../services/workspace.service";

type ViewMode = 'gallery' | 'list';

@Component({
  selector: 'dmm-group-cart',
  templateUrl: './group-cart.component.html',
  styleUrls: ['./group-cart.component.scss'],
})
export class GroupCartComponent {
  viewModes: ViewMode[] = ['gallery', 'list'];
  currentViewMode: ViewMode = 'gallery';

  selected: Molecule[] = [];
  comparisonViewOpen = false;

  constructor(
    private workspaceService: WorkspaceService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      const groupId = Number(paramMap.get('groupId'));
      const blockSetId = paramMap.get('blockSetId') as BlockSetId;
      this.workspaceService.reset(groupId, blockSetId);
    });
  }

  get groupCart$() {
    return this.workspaceService.groupCart$;
  }

  get blockSet$() {
    return this.workspaceService.blockSet$;
  }

  removeFromSelected(molecule: Molecule) {
    this.selected = this.selected.filter((m) => m !== molecule);
  }

  goBackToWorkspace() {
    this.location.back();
  }

  protected readonly lookupProperty = lookupProperty;
}
