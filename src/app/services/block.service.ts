import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { BlockSet } from '../models';
import { ActivatedRoute } from '@angular/router';
import { ColorWheelBlockSet } from '../block-sets/color-wheel';

export enum BlockSetId {
  ColorWheel = 'COLOR_WHEEL',
  OPV = 'OPV',
}

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  private _blockSet$ = new BehaviorSubject<BlockSet | null>(null);

  /**
   * Async access. No null check needed. Use `blockSet` instead for sync code.
   */
  get blockSet$(): Observable<BlockSet> {
    return this._blockSet$.pipe(
      filter((blockSet): blockSet is BlockSet => !!blockSet),
    );
  }

  /**
   * Sync access. Requires null check. Use `blockSet$` instead for async code.
   */
  get blockSet() {
    return this._blockSet$.value;
  }

  constructor(
    private http: HttpClient,
    private injector: Injector,
    route: ActivatedRoute,
  ) {
    route.queryParamMap.subscribe((queryParamMap) => {
      let blockSetId = BlockSetId.ColorWheel;
      if (
        Object.values(BlockSetId).includes(
          queryParamMap.get('blockSet') as BlockSetId,
        )
      ) {
        blockSetId = queryParamMap.get('blockSet')! as BlockSetId;
      }

      this.loadBlockSet(blockSetId);
    });
  }

  private loadBlockSet(blockSetId: BlockSetId): void {
    const blockSet = this.getBlockSetImpl(blockSetId);
    blockSet.initialized$.subscribe((initialized) => {
      if (initialized) {
        this._blockSet$.next(blockSet);
      }
    });
  }

  private getBlockSetImpl(blockSetId: BlockSetId): BlockSet {
    switch (blockSetId) {
      case BlockSetId.ColorWheel: {
        return this.injector.get(ColorWheelBlockSet);
      }
      case BlockSetId.OPV:
        throw 'Not Implemented';
    }
  }
}
