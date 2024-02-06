import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';

import { RigJob } from '../models';

import {EnvironmentService} from "./environment.service";

@Injectable({
  providedIn: 'root',
})
export class RigService {
  private get RIG_URL() {
    const { hostname } = this.envService.getEnvConfig();
    return `${hostname}/synthesize`;
  }

  constructor(private http: HttpClient, private envService: EnvironmentService) {}

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
