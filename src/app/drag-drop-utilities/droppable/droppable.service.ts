// Based on https://stackblitz.com/edit/cdk-drag-drop?file=app%2Fapp.component.html

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export interface DroppableEvent {
  nativeEvent: PointerEvent;
  group: string;
  data: any;
}

@Injectable({
  providedIn: 'root',
})
export class DroppableService {
  dragStart$: Observable<DroppableEvent>;
  dragEnd$: Observable<DroppableEvent>;

  private _dragStartSubject = new Subject<DroppableEvent>();
  private _dragEndSubject = new Subject<DroppableEvent>();

  constructor() {
    this.dragStart$ = this._dragStartSubject.asObservable();
    this.dragEnd$ = this._dragEndSubject.asObservable();
  }

  dragStarted(group: string, data: any, event: PointerEvent) {
    this._dragStartSubject.next({
      group: group,
      nativeEvent: event,
      data: data,
    });
  }

  dragEnded(group: string, data: any, event: PointerEvent) {
    this._dragEndSubject.next({
      group: group,
      nativeEvent: event,
      data: data,
    });
  }
}
