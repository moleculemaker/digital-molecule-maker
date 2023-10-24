import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[custom-draggable]',
})
export class CustomDraggableDirective {
  private isMouseDown = false;
  private clickDisabled = false;
  private timer = -1;

  constructor(private el: ElementRef<HTMLElement>) {
    this.el.nativeElement.addEventListener(
      'click',
      (e) => {
        if (this.clickDisabled) {
          e.stopImmediatePropagation();
          this.clickDisabled = false;
        }
      },
      {
        capture: true,
      },
    );
  }

  @HostListener('mousedown') mouseDown() {
    this.isMouseDown = true;
  }

  @HostListener('pointermove')
  onPointerMove() {
    if (this.isMouseDown) {
      clearTimeout(this.timer);
      this.timer = window.setTimeout(() => (this.clickDisabled = true), 200);
    }
  }

  @HostListener('mouseup') mouseUp() {
    this.isMouseDown = false;
    window.clearTimeout(this.timer);
  }
}
