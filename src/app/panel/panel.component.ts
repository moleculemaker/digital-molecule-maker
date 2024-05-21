import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  trigger,
  transition,
  AnimationEvent,
  useAnimation,
} from '@angular/animations';

import {
  bounceIn,
  bounceOut,
  slideIn,
  slideOut,
} from './panel.animations';
import { BlockSet, Molecule } from '../models';
import { Router } from '@angular/router';
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: 'panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  animations: [
    //unable to animation rgba backgroundColor and backdropFilter using angular...moved that animation to normal css
    trigger('panelAnimation', [
      transition(':enter', [useAnimation(slideIn)]),
      transition(':leave', [useAnimation(slideOut)]),
    ]),
    trigger('panelCloseButtonAnimation', [
      transition(':enter', [useAnimation(bounceIn)]),
      transition(':leave', [useAnimation(bounceOut)]),
    ]),
  ],
})
export class PanelComponent implements OnInit {
  @Input()
  blockSet?: BlockSet;

  @Output()
  onClose = new EventEmitter();

  @Output()
  onSendBackToWorkspace = new EventEmitter<Molecule>();

  isPanelActive = true;

  maxSteps = 5;

  //********************************************
  constructor(
    private workspaceService: WorkspaceService,
    private router: Router,
  ) {}

  get personalCart$() {
    return this.workspaceService.personalCart$;
  }

  get group$() {
    return this.workspaceService.group$;
  }

  //********************************************
  ngOnInit(): void {
    this.openPanel();
  }

  //********************************************
  openPanel() {
    this.isPanelActive = true;
  }

  //********************************************
  closePanel() {
    this.isPanelActive = false;
  }

  //********************************************
  onPanelAnimationEvent(e: AnimationEvent) {
    //callback
    if (e.toState == 'void') {
      this.onClose.emit();
    }
  }

  sendBackToWorkspace(molecule: Molecule) {
    this.onSendBackToWorkspace.emit(molecule);
  }

  viewGroupCart() {
    const group = this.group$.value;
    if (group) {
      this.router.navigateByUrl(`/groups/${group.id}/cart`);
    }
  }

  addToGroupCart() {
    this.workspaceService.submitMolecules(this.personalCart$.value);
  }
}
