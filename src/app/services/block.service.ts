import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { delayWhen, map, tap } from 'rxjs/operators';
import { Block, BlockSet, BlockType } from '../models';
import { getSVGViewBox } from '../utils/svg';

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
            [
              ...blockSet.blocks.start,
              ...blockSet.blocks.middle,
              ...blockSet.blocks.end,
            ].map((block) => this.patchSvgDimensions(block)),
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
