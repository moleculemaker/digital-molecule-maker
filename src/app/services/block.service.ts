import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {BlockSet} from '../models';
import {opv} from "../utils/dft";

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

  constructor(private http: HttpClient) {
  }

  getBlockSet(blockSetId: BlockSetId): Observable<BlockSet> {
    return of(opv);



    // const httpOptions = {
    //   headers: new HttpHeaders({
    //     'Content-Type': 'application/json',
    //     Authorization: 'my-auth-token',
    //   }),
    // };
    //
    // return this.http.get<BlockSet>(this.urls.get(blockSetId)!, httpOptions);
  }
}
