import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BlockSet } from '../models';
import { tap } from 'rxjs/operators';

export enum BlockSetId {
  ColorWheel = 'ColorWheel_20230504',
  OPV = 'OPV_20230504',
  Chem437 = 'Chem_437',
  Samys12 = 'Samys12'
}

@Injectable({
  providedIn: 'root',
})
export class BlockService {
  urls = new Map<BlockSetId, string>([
    [BlockSetId.ColorWheel, 'assets/blocks/ColorWheel_20230504/data.json'],
    [BlockSetId.OPV, 'assets/blocks/OPV_20230504/data.json'],
    [BlockSetId.Chem437, 'assets/blocks/Chem_437/data.json'],
    [BlockSetId.Samys12, 'assets/blocks/Samys12/data.json']
  ]);

  private cache = new Map<BlockSetId, BlockSet>();

  constructor(private http: HttpClient) {}

  getBlockSet(blockSetId: BlockSetId): Observable<BlockSet> {
    if (this.cache.has(blockSetId)) {
      return of(this.cache.get(blockSetId)!);
    }

    return this.http
      .get<BlockSet>(this.urls.get(blockSetId)!)
      .pipe(tap((blocksSet) => this.cache.set(blockSetId, blocksSet)));
  }
}
