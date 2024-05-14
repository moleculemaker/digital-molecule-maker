import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent implements OnInit {
  currentStep: any | null = null; //if null, the tutorial will not show
  steps: any[] = [];

  videos = [
    { title: 'Workspace', id: '1_8elni4dv' },
    { title: 'Block Tray', id: '1_gchbjezj' },
    { title: 'Structure-Function', id: '1_g2u2woll' },
    { title: 'Zoom', id: '1_9qo362mt' },
    { title: 'Filter', id: '1_z7evpegt' },
    { title: 'Build and Properties', id: '1_qbzk4ge6' },
    { title: 'Graph', id: '1_m6hmfn2h' },
    { title: '2D 3D', id: '1_e5x2eqb2' },
    { title: 'Add to Cart', id: '1_r966r46v' },
    { title: 'Help', id: '1_iaztli3e' },
  ];

  currentVideoIndex = 0;
  readonly videoCount = 10;

  //********************************************
  ngOnInit(): void {
    this.steps = [
      { id: 'welcome', class: '' },
      { id: 'videos', class: 'wide' },

      // { id: 'workspace', class: '' },
      // { id: 'blocks', class: '' },

      // { id: 'build', class: '' },
      // { id: 'build_002', class: 'wide' },
      // { id: 'build_003', class: 'wide' },
      // { id: 'build_004', class: 'wide' },

      { id: 'finish', class: '' },
    ];

    //start tutorial right away?
    this.start();
  }

  //********************************************
  ngAfterViewInit() {}

  //********************************************
  start() {
    this.currentStep = this.steps[0];
  }

  //********************************************
  close() {
    this.currentStep = null;
  }

  //********************************************
  getCurrentStepIndex() {
    return this.steps.findIndex((item, index) => {
      return item == this.currentStep;
    });
  }

  //********************************************
  previousStep() {
    let index = this.getCurrentStepIndex();
    this.currentStep = index > 0 ? this.steps[index - 1] : 0;
  }

  //********************************************
  nextStep() {
    let index = this.getCurrentStepIndex();
    this.currentStep =
      index <= this.steps.length - 1
        ? this.steps[index + 1]
        : this.steps[this.steps.length - 1];
  }

  previousVideo() {
    if (this.currentVideoIndex === 0) {
      this.previousStep();
    } else {
      --this.currentVideoIndex;
    }
  }

  nextVideo() {
    if (this.currentVideoIndex === this.videoCount - 1) {
      this.nextStep();
    } else {
      ++this.currentVideoIndex;
    }
  }
}
