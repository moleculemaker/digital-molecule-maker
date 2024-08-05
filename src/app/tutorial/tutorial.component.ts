import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss'],
})
export class TutorialComponent {
  steps = [
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

  index = 0;

  get currentStep() {
    return this.steps[this.index]!;
  }

  currentVideoIndex = 0;
  readonly videoCount = 10;

  @Input()
  completed!: boolean;

  @Output()
  onClose = new EventEmitter<void>();

  close() {
    this.index = 0;
    this.onClose.emit();
  }

  previousStep() {
    if (this.index > 0) {
      this.index--;
    }
  }

  nextStep() {
    if (this.index < this.steps.length - 1) {
      this.index++;
    }
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
