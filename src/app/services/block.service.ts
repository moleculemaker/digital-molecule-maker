import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { Block, BlockSet } from '../models';

export enum BlockSetId {
  ColorWheel = 'ColorWheel_20230504',
  OPV = 'OPV_20230504',
}

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  urls = new Map<BlockSetId, string>([
    [BlockSetId.ColorWheel, 'assets/blocks/10x10x10palette/data.json'],
    [BlockSetId.OPV, 'assets/blocks/opv/data.json'],
  ]);

  constructor(private http: HttpClient) {}

  getBlockSet(blockSetId: BlockSetId): Observable<BlockSet> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token',
      }),
    };

    return this.http.get<BlockSet>(this.urls.get(blockSetId)!, httpOptions);
  }
}
