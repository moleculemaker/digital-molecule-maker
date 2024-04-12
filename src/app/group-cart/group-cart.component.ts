import { Component } from '@angular/core';
import { Molecule } from '../models';
import { CartService } from '../services/cart.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { lookupProperty } from '../lookup';
import { BlockSetId } from '../services/block.service';

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
    private cartService: CartService,
    private location: Location,
    private route: ActivatedRoute,
  ) {
    this.route.paramMap.subscribe((paramMap) => {
      const groupId = Number(paramMap.get('groupId'));
      const blockSetId = paramMap.get('blockSetId') as BlockSetId;
      this.cartService.reset(groupId, blockSetId);
    });
  }

  get groupCart$() {
    return this.cartService.groupCart$;
  }

  get blockSet$() {
    return this.cartService.blockSet$;
  }

  removeFromSelected(molecule: Molecule) {
    this.selected = this.selected.filter((m) => m !== molecule);
  }

  goBackToWorkspace() {
    this.location.back();
  }

  protected readonly lookupProperty = lookupProperty;
}
