// Based on https://stackblitz.com/edit/cdk-drag-drop?file=app%2Fapp.component.html

import {
  ContentChild,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  OnDestroy,
} from '@angular/core';
import { DraggableHelperDirective } from './draggable-helper.directive';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[dfDraggable]',
})
export class DraggableDirective implements OnDestroy {
  @HostBinding('class.draggable')
  enabled = true;

  @Input('dfDraggableDisabled')
  disabled = false;

  @HostBinding('class.dragging')
  dragging = false;

  @HostBinding('style.touch-action')
  touchAction = 'pan-y';

  @ContentChild(DraggableHelperDirective) helper?: DraggableHelperDirective;

  @Output() dragStart = new EventEmitter<PointerEvent>();
  @Output() dragMove = new EventEmitter<PointerEvent>();
  @Output() dragEnd = new EventEmitter<PointerEvent>();

  private _timeout!: ReturnType<typeof setTimeout>;
  private _selectSubscription: Subscription | undefined;

  ngOnDestroy() {
    if (this._selectSubscription) {
      this._selectSubscription.unsubscribe();
    }
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    if (this.disabled) return;

    event.stopPropagation();

    // Must cancel implicit pointer capture on touchscreens
    // See: https://www.w3.org/TR/pointerevents/#implicit-pointer-capture
    const el=  event.target as Element;
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }

    if (!this.helper) {
      throw new Error('Drag helper not defined');
    }

    // prevent the cursor from selecting
    this._selectSubscription = fromEvent(document, 'selectstart').subscribe(
      (ev: Event) => ev.preventDefault(),
    );

    // small timeout to prevent click start dragging
    this._timeout = setTimeout(() => {
      this.dragging = true;
      this.helper?.onDragStart(event);
      this.dragStart.next(event);
    }, 5);
  }

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    if (this.dragging) {
      this.helper?.onDragMove(event);
      this.dragMove.next(event);
    }
  }

  @HostListener('document:pointercancel', ['$event'])
  @HostListener('document:pointerup', ['$event'])
  onPointerUp(event: PointerEvent) {
    clearTimeout(this._timeout);

    if (this.dragging) {
      this.dragging = false;
      this.helper?.onDragEnd(event);
      this.dragEnd.next(event);

      if (this._selectSubscription) {
        this._selectSubscription.unsubscribe();
        this._selectSubscription = undefined;
      }
    }
  }
}
