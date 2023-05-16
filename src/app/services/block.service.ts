import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Block, BlockSet, BlockType } from '../models';


export enum BlockSetId {
  ColorWheel = 'COLOR_WHEEL',
  OPV = 'OPV'
}

@Injectable({
  providedIn: 'root'
})
export class BlockService {

  urls = new Map<BlockSetId, string>([
    [BlockSetId.ColorWheel, 'assets/blocks/10x10x10palette/blocks.json']
  ]);

  constructor(private http: HttpClient) {

  }

  getBlockSet(blockSetId: BlockSetId) : Observable<BlockSet> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'my-auth-token'
      })
    };

    return this.http.get<BlockSet>(this.urls.get(blockSetId)!, httpOptions);
  }

}
