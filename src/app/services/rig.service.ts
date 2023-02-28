import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';

import { Block } from '../models';
import { blockSetIds } from './block.service';

@Injectable({
  providedIn: 'root'
})
export class RigService {

  //private RIG_URL = 'http://128.174.226.165:8001/Rig@Beckman/';
  private RIG_JOB_URL = '/api/v1/rig_job/';

  constructor(private http: HttpClient) { }

  submitReaction(blockSetId: blockSetIds, block1: Block, block2: Block, block3: Block, moleculeName: string): Observable<null> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'my-auth-token'
      })
    };

    const rigJob = {
      blockSetId,
      blockIds: [
        block1.id,
        block2.id,
        block3.id
      ],
      moleculeName
    }

    return this.http.post(this.RIG_JOB_URL, rigJob, httpOptions)
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
