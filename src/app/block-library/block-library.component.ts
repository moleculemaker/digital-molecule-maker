import { Component } from '@angular/core';
import {Router} from "@angular/router";
import {BlockSetId} from "../services/block.service";

@Component({
  selector: 'dmm-block-library',
  templateUrl: './block-library.component.html',
  styleUrls: ['./block-library.component.scss']
})
export class BlockLibraryComponent {
  constructor(private router: Router) {
  }

  goToPersonalWorkspace(blockSetId: BlockSetId) {
    this.router.navigateByUrl(`/library/${blockSetId}/build`).then(console.log, console.error)
  }

  protected readonly BlockSetId = BlockSetId;
}
