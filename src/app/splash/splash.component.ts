import { Component, HostListener, OnInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {
  @ViewChild('blueLeftEye') blueLeftEye: ElementRef|null = null;
  @ViewChild('blueRightEye') blueRightEye: ElementRef|null = null;

  @HostListener('document:mousemove', ['$event']) onMouseMove(e:MouseEvent) {this.mouseMove(e);}

  showForm = false;
  showSplash = true;

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
      const rect = this.blueLeftEye.nativeElement.getBoundingClientRect();

      const mouse = {
        x: (rect.left + (rect.width / 2)) - e.clientX,
        y: (rect.top + (rect.height / 2)) - e.clientY
      };

      const rotation = Math.atan2(mouse.x, mouse.y) * 180 / Math.PI;

      this.blueLeftEye.nativeElement.style.setProperty('--deg', (-rotation + eyeOffset) + 'deg');
    }

    if (this.blueRightEye) {
      const rect = this.blueRightEye.nativeElement.getBoundingClientRect();

      const mouse = {
        x: (rect.left + (rect.width / 2)) - e.clientX,
        y: (rect.top + (rect.height / 2)) - e.clientY
      };

      const rotation = Math.atan2(mouse.x, mouse.y) * 180 / Math.PI;

      this.blueRightEye.nativeElement.style.setProperty('--deg', (-rotation + eyeOffset) + 'deg');
    }
  }

  //********************************************
  onGetStarted(): void {
    this.showForm = true;
    // TODO once we support the login form, remove showSplash variable here and handle in the parent component
    this.onHideSplash();
  }

  onHideSplash(): void {
    this.showSplash = false;
  }
}
