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
    {
      id: '1_8elni4dv',
      title: 'Workspace',
      description:
        'This is the workspace, a sandbox where you can design the molecules you want!',
    },
    {
      id: '1_gchbjezj',
      title: 'Block Tray',
      description:
        'This is the block tray, an area that stores Lego-like molecule blocks. You will use them to build your molecules.',
    },
    {
      id: '1_g2u2woll',
      title: 'Structure-Function',
      description:
        'Can can change the block information from structure to function view at any time. Click on an individual block to switch between function and structure modes',
    },
    {
      id: '1_9qo362mt',
      title: 'Zoom',
      description:
        'You can Zoom your in-process molecule, or click to reset to default view.',
    },
    {
      id: '1_z7evpegt',
      title: 'Filter',
      description: 'Filter by block type using tags',
    },
    {
      id: '1_qbzk4ge6',
      title: 'Build and Properties',
      description:
        "Now that you know where everything in the DMM is, let’s show you how to build your first molecule! Click (our touch) and drag a molecule onto the worksapce to get started. When you complete a molecule you will see a summary of it's properties on the left.",
    },
    {
      id: '1_m6hmfn2h',
      title: 'Graph',
      description:
        'When you start making block choices, the graph will update with how many molecules are still possible.',
    },
    {
      id: '1_e5x2eqb2',
      title: '2D 3D',
      description:
        'Use the arrows to cycle to different views of your molecule, or click the image to go full screen.',
    },
    {
      id: '1_r966r46v',
      title: 'Add to Cart',
      description:
        'If you have an account, you can add a completed molecule to your cart  to save it and work on another.',
    },
    {
      id: '1_iaztli3e',
      title: 'Help',
      description:
        'Click on your user icon to access shared groups, change your block set, or log out. Click "Help" to access a glossary and tips on advanced features.',
    },
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
