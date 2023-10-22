import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[custom-draggable]',
})
export class CustomDraggableDirective {
  private isMouseDown = false;
  private clickDisabled = false;
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
      }
    );
  }

  @HostListener('mousedown') mouseDown() {
    this.isMouseDown = true;
  }

  @HostListener('mousemove') mouseMove() {
    if (this.isMouseDown) {
      this.clickDisabled = true;
    }
  }

  @HostListener('mouseup') mouseUp() {
    this.isMouseDown = false;
  }
}
