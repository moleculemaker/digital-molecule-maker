import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'tutorial',
  templateUrl: './tutorial.component.html',
  styleUrls: ['./tutorial.component.scss']
})
export class TutorialComponent implements OnInit {
  currentStep: any|null = null; //if null, the tutorial will not show
  steps: any[] = [];

  //********************************************
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  //********************************************
  ngOnInit(): void {
    this.steps = [
      {id: 'welcome', class: ''},
      {id: 'workspace', class: ''},
      {id: 'blocks', class: ''},

      {id: 'build', class: ''},
      {id: 'build_002', class: 'wide'},
      {id: 'build_003', class: 'wide'},
      {id: 'build_004', class: 'wide'},

      {id: 'finish', class: ''},
    ];

    //start tutorial right away?
    this.start();
  }

  //********************************************
  ngAfterViewInit() {
  }

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
    return this.steps.findIndex((item, index)=>{
      return item == this.currentStep;
    });
  }

  //********************************************
  previousStep() {
    let index = this.getCurrentStepIndex();
    this.currentStep = (index > 0) ? this.steps[index - 1] : 0;
  }

  //********************************************
  nextStep() {
    let index = this.getCurrentStepIndex();
    this.currentStep = (index <= this.steps.length - 1) ? this.steps[index + 1] : this.steps[this.steps.length - 1];
  }
}
