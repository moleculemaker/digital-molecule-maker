import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[custom-draggable]',
})
export class CustomDraggableDirective {
  private isMouseDown = false;
  private clickDisabled = false;
  private actionStart = -1;

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
    this.actionStart = Date.now();
  }

  @HostListener('pointermove')
  onPointerMove() {
    if (this.isMouseDown) {
      if (Date.now() - this.actionStart > 100) {
        this.clickDisabled = true;
      }
    }
  }

  @HostListener('mouseup') mouseUp() {
    this.isMouseDown = false;
  }
}
