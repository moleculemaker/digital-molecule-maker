import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Block, BlockSet, BlockType } from '../models';
import { ActivatedRoute } from '@angular/router';

export enum BlockSetId {
  ColorWheel = 'COLOR_WHEEL',
  OPV = 'OPV',
}

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  urls = new Map<BlockSetId, string>([
    [BlockSetId.ColorWheel, 'assets/blocks/10x10x10palette/blocks.json'],
    [BlockSetId.OPV, 'assets/blocks/opv/blocks.json'],
  ]);

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
      this.getBlockSet(blockSetId).subscribe((blockSet) => {
        this._blockSet$.next(blockSet);
      });
    });
  }

  private getBlockSet(blockSetId: BlockSetId): Observable<BlockSet> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token',
      }),
    };

    return this.http.get<BlockSet>(this.urls.get(blockSetId)!, httpOptions);
  }
}
