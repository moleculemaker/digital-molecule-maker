import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import {
  state,
  trigger,
  transition,
  style,
  animate,
  AnimationEvent,
  useAnimation,
} from '@angular/animations';

import {
  blurIn,
  blurOut,
  bounceIn,
  bounceOut,
  slideIn,
  slideOut,
  slideInReverse,
  slideOutReverse,
} from './panel.animations';
import { BlockSet, Molecule } from '../models';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { WorkspaceService } from '../services/workspace.service';

@Component({
  selector: 'panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  animations: [
    //unable to animation rgba backgroundColor and backdropFilter using angular...moved that animation to normal css

    trigger('panelAnimation', [
      state('increasing', style({})),
      state('decreasing', style({})),

      transition('void => increasing', [useAnimation(slideIn)]),
      transition('void => decreasing', [useAnimation(slideInReverse)]),
      transition('increasing => void', [useAnimation(slideOut)]),
      transition('decreasing => void', [useAnimation(slideOutReverse)]),
    ]),
    trigger('panelCloseButtonAnimation', [
      transition(':enter', [useAnimation(bounceIn)]),
      transition(':leave', [useAnimation(bounceOut)]),
    ]),
    /*
//example if you want to pass params... can delete here as needed
      transition(':enter', [useAnimation(slideIn, { //void => *
        params: {
          time: '400ms',
        }}
      )]),
*/
  ],
})
export class PanelComponent implements OnInit {
  @Input()
  blockSet?: BlockSet;

  @Output()
  onClose = new EventEmitter();

  @Output()
  onSubmit = new EventEmitter<Molecule[]>();

  @Output()
  onSendBackToWorkspace = new EventEmitter<Molecule>();

  isPanelActive = true;

  isIncreasing = true; //flag to determine if the steps are increasing or decreasing
  step = 0;
  maxSteps = 5;

  //********************************************
  constructor(
    private workspaceService: WorkspaceService,
    private cartService: CartService,
    private router: Router,
  ) {}

  get personalCart$() {
    return this.cartService.personalCart$;
  }

  get group$() {
    return this.cartService.group$;
  }

  //********************************************
  ngOnInit(): void {
    this.openFirstPanel();
  }

  //********************************************
  ngAfterViewInit() {}

  //********************************************
  nextStep() {
    if (this.step >= this.maxSteps) {
      return;
    }

    this.isIncreasing = true;

    //wrap in a timeout so is_increasing actually changes before the animation is called
    setTimeout(() => {
      this.step++;
    }, 0);
  }

  //********************************************
  previousStep() {
    if (this.step <= 0) {
      return;
    }

    this.isIncreasing = false;

    //wrap in a timeout so is_increasing actually changes before the animation is called
    setTimeout(() => {
      this.step--;
    }, 0);
  }

  //********************************************
  openFirstPanel() {
    this.isPanelActive = true;

    this.step = 0;
    this.nextStep();
  }

  //********************************************
  closeAll() {
    this.isPanelActive = false;

    this.isIncreasing = false; //to make the panels slide off the screen

    //wrap in a timeout so is_increasing actually changes before the animation is called
    setTimeout(() => {
      this.step = 0;
    }, 0);
  }

  //********************************************
  onPanelAnimationEvent(e: AnimationEvent) {
    //callback
    if (e.toState == 'void') {
      this.onClose.emit();
    }
  }

  canSubmitMolecule(): boolean {
    return true;
    // const workingName = this.moleculeName?.trim() || '';
    // return workingName.length > 0;
  }

  submitMolecules(): void {
    // this.onSubmit.emit(this.cartMoleculeList);
    // for now, use the second panel as the success message
    this.nextStep();
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
    this.cartService.addMyMoleculesToGroupCart();
  }
}
