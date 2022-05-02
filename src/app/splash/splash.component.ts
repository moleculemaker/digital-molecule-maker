import { Component, HostListener, Input, OnInit, ElementRef, ViewChild } from '@angular/core';

//import "external-svg-loader";

@Component({
  selector: 'splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  @ViewChild('blueLeftEye') blueLeftEye: ElementRef|null = null;
  @ViewChild('blueRightEye') blueRightEye: ElementRef|null = null;

  @HostListener('document:mousemove', ['$event']) onMouseMove(e:MouseEvent) {this.mouseMove(e);}

  showForm: boolean = false;

  constructor() { }

  //********************************************
  ngOnInit(): void {
  }

  //********************************************
  ngAfterViewInit() {
    //setup eye movements
  }

  //********************************************
  mouseMove(e:MouseEvent) {
    const eyeOffset = -135;

    if (this.blueLeftEye) {
      var rect = this.blueLeftEye.nativeElement.getBoundingClientRect();

      var mouse = {
        x: (rect.left + (rect.width / 2)) - e.clientX,
        y: (rect.top + (rect.height / 2)) - e.clientY
      };

      var rotation = Math.atan2(mouse.x, mouse.y) * 180 / Math.PI;

      this.blueLeftEye.nativeElement.style.setProperty('--deg', (-rotation + eyeOffset) + 'deg');
    }

    if (this.blueRightEye) {
      var rect = this.blueRightEye.nativeElement.getBoundingClientRect();

      var mouse = {
        x: (rect.left + (rect.width / 2)) - e.clientX,
        y: (rect.top + (rect.height / 2)) - e.clientY
      };

      var rotation = Math.atan2(mouse.x, mouse.y) * 180 / Math.PI;

      this.blueRightEye.nativeElement.style.setProperty('--deg', (-rotation + eyeOffset) + 'deg');
    }
  }

  //********************************************
  onClick(): void {
    if (!this.showForm) {
      this.showForm = true;
    } else {
      //todo: validate and process form information
    }
  }
}
