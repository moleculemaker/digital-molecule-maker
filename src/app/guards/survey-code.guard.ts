import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../services/user.service';

@Injectable()
export class CanActivateSurveyCode implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean|UrlTree>|Promise<boolean|UrlTree>|boolean|UrlTree {
    // if the current route expects a code, return true if and only if we have a code
    return this.userService.getUser().pipe(
      map(user => {
        let ok = false;
        if (route.queryParams.code === 'false' || route.queryParams.code === undefined) {
          ok = true;
        } else if (user?.surveyCode) {
          ok = user.surveyCode.trim().length > 0;
        }
        return ok || this.router.parseUrl('/activity');
      }) 
    );
  }
}
