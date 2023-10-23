import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';

import { RigJob } from '../models';

@Injectable({
  providedIn: 'root',
})
export class RigService {
  private RIG_URL = 'https://dmm.fastapi.mmli1.ncsa.illinois.edu/synthesize';

  constructor(private http: HttpClient) {}

  submitReactions(rigJobs: RigJob[]): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: 'my-auth-token',
      }),
    };

    console.log(rigJobs);
    return this.http.post(this.RIG_URL, rigJobs, httpOptions).pipe(
      timeout(5000),
      map((resp) => resp),
      catchError((e) => {
        // do something on a timeout
        console.log('Error during molecule synthesis:', e);
        return of(null);
      }),
    );
  }
}
