import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';

import { Block, BlockSet } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RigService {

  private RIG_URL = 'https://dmm.fastapi.mmli1.ncsa.illinois.edu/synthesize';

  constructor(private http: HttpClient) { }

  submitReaction(blockSet: BlockSet, block1: Block, block2: Block, block3: Block, moleculeName: string): Observable<null> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'my-auth-token'
      })
    };

    const rigJob = {
      block_set_id: blockSet.id,
      block_ids: [
        block1.id,
        block2.id,
        block3.id
      ],
      molecule_name: moleculeName
    }

    return this.http.post(this.RIG_URL, rigJob, httpOptions)
      .pipe(
        timeout(5000),
        map(resp => null),
        catchError(e => {
          // do something on a timeout
          return of(null);
        })
      );
  }

}
