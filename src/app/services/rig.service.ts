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

  submitReactions(rigJobs: any[]): Observable<null> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        Authorization: 'my-auth-token'
      })
    };

    return this.http.post(this.RIG_URL, rigJobs, httpOptions)
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
