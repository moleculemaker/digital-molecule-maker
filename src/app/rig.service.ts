import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, timeout, catchError } from 'rxjs/operators';

import { Block } from '../app/models';

@Injectable({
  providedIn: 'root'
})
export class RigService {

  private RIG_URL = 'http://10.193.131.18:8001/Rig@Beckman/';

  constructor(private http: HttpClient) { }

  submitReaction(block1: Block, block2: Block, block3: Block): Observable<null> {
    const url = this.RIG_URL + 'Make?Block_1=' + block1.id +
      '&Block_2=' + block2.id +
      '&Block_3=' + block3.id;
    return this.http.get(url)
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
