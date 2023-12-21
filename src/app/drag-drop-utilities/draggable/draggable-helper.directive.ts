// Based on https://stackblitz.com/edit/cdk-drag-drop?file=app%2Fapp.component.html

import {
  Directive,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  GlobalPositionStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { CdkPortal } from '@angular/cdk/portal';

@Directive({
  selector: '[dfDraggableHelper]',
})
export class DraggableHelperDirective implements OnInit, OnDestroy {
  private _dragElement!: HTMLElement;
  private _relPosition!: { x: number; y: number };
  private _overlayRef!: OverlayRef;
  private _positioningStrategy!: GlobalPositionStrategy;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainerRef: ViewContainerRef,
    private overlay: Overlay,
  ) {}

  ngOnInit(): void {
    this._positioningStrategy = new GlobalPositionStrategy();
    this._overlayRef = this.overlay.create({
      positionStrategy: this._positioningStrategy,
    });
  }

  ngOnDestroy(): void {
    this._overlayRef.dispose();
  }

  onDragStart(event: PointerEvent): void {
    this._dragElement = event.target as HTMLElement;

    const { top, left } = this._dragElement.getBoundingClientRect();
    this._relPosition = {
      x: left - event.pageX,
      y: top - event.pageY,
    };
  }

  onDragMove(event: PointerEvent): void {
    if (!this._overlayRef.hasAttached()) {
      this._overlayRef.attach(
        new CdkPortal(this.templateRef, this.viewContainerRef),
      );
      this._overlayRef.overlayElement.style.pointerEvents = 'none'; //overlay html element is never the target of pointer events
    }

    this._positioningStrategy.left(`${event.pageX + this._relPosition.x}px`);
    this._positioningStrategy.top(`${event.pageY + this._relPosition.y}px`);
    this._positioningStrategy.apply();
  }

  onDragEnd(event: PointerEvent): void {
    if (this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    }
  }
}
