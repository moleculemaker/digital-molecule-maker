import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { delayWhen, map, tap } from 'rxjs/operators';
import { Block, BlockSet } from '../models';
import { getSVGViewBox } from '../utils/svg';

export enum BlockSetId {
  ColorWheel = 'COLOR_WHEEL',
  OPV = 'OPV',
  // TODO: remove these
  Test2Block = 'TEST_2_BLOCK',
  Test4Block = 'TEST_4_BLOCK',
  Test5Block = 'TEST_5_BLOCK',
}

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  urls = new Map<BlockSetId, string>([
    [BlockSetId.ColorWheel, 'assets/blocks/10x10x10palette/blocks.json'],
    [BlockSetId.OPV, 'assets/blocks/opv/blocks.json'],
    // TODO: remove these
    [BlockSetId.Test2Block, 'assets/blocks/___test___/2-block.json'],
    [BlockSetId.Test4Block, 'assets/blocks/___test___/4-block.json'],
    [BlockSetId.Test5Block, 'assets/blocks/___test___/5-block.json'],
  ]);

  constructor(private http: HttpClient) {}

  getBlockSet(blockSetId: BlockSetId): Observable<BlockSet> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token',
      }),
    };

    return this.http
      .get<BlockSet>(this.urls.get(blockSetId)!, httpOptions)
      .pipe(
        delayWhen((blockSet) =>
          forkJoin(
            blockSet.blocks.map((block) => this.patchSvgDimensions(block)),
          ),
        ),
      );
  }

  private patchSvgDimensions(block: Block) {
    return this.http.get(block.svgUrl, { responseType: 'text' }).pipe(
      map(getSVGViewBox),
      tap(([x, y, width, height]) => {
        block.width = width;
        block.height = height;
      }),
    );
  }
}
