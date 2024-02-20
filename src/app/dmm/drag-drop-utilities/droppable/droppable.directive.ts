// Based on https://stackblitz.com/edit/cdk-drag-drop?file=app%2Fapp.component.html

import { Directive, Input, OnInit, OnDestroy } from '@angular/core';
import { DraggableDirective } from '../draggable/draggable.directive';
import { DroppableService } from './droppable.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
  selector: '[dfDroppable]',
})
export class DroppableDirective
  extends DraggableDirective
  implements OnInit, OnDestroy
{
  @Input('dfDroppable') group!: string;
  @Input('dfDroppableData') data: any;

  private _destroy$ = new Subject();

  constructor(private _droppableService: DroppableService) {
    super();
  }

  ngOnInit(): void {
    this.dragStart
      .pipe(takeUntil(this._destroy$))
      .subscribe((event) =>
        this._droppableService.dragStarted(this.group, this.data, event),
      );

    this.dragEnd
      .pipe(takeUntil(this._destroy$))
      .subscribe((event) =>
        this._droppableService.dragEnded(this.group, this.data, event),
      );
  }

  ngOnDestroy() {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
