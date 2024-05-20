import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { User, UserGroup } from '../models';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { BlockSetId } from './block.service';

export const GUEST_USER = 'guest';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  user$ = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private router: Router,
  ) {
    try {
      this.user$.next(JSON.parse(localStorage.getItem('dmm-user') || 'null'));
    } catch {}
  }

  isLoggedIn() {
    const user = this.user$.value;
    if (!user) {
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
    return !!user;
  }

  isGuest() {
    return this.user$.value?.username === GUEST_USER;
  }

  isAdmin() {
    return this.user$.value?.id === 0;
  }

  loginAsGuest() {
    this.setUser({
      id: -1,
      name: 'Guest',
      username: GUEST_USER,
      access_token: '',
    });
  }

  logout() {
    this.setUser(null);
    location.reload();
  }

  setUser(user: User | null): void {
    this.user$.next(user);
    localStorage.setItem('dmm-user', JSON.stringify(user));
  }

  getUser(): Observable<User | null> {
    return this.user$.asObservable();
  }

  getUserGroups() {
    const { hostname } = this.envService.getEnvConfig();
    return this.http.get<UserGroup[]>(`${hostname}/me/groups`, {
      headers: {
        authorization: `Bearer ${this.user$.value?.access_token}`,
      },
    });
  }

  getGroupInfo(groupId: number) {
    const { hostname } = this.envService.getEnvConfig();
    return this.http.get<UserGroup>(`${hostname}/groups/${groupId}`, {
      headers: {
        authorization: `Bearer ${this.user$.value?.access_token}`,
      },
    });
  }

  generateCode() {
    const { hostname } = this.envService.getEnvConfig();
    return this.http.post<{
      expires_in: number;
      code: string;
    }>(
      `${hostname}/auth/generate-code`,
      {
        expires_in: 24 * 60 * 60,
      },
      {
        headers: {
          authorization: `Bearer ${this.user$.value?.access_token}`,
        },
      },
    );
  }

  createGroup(joinCode: string, name: string, blockSetId: BlockSetId) {
    const { hostname } = this.envService.getEnvConfig();
    return this.http.post<UserGroup[]>(
      `${hostname}/groups/`,
      {
        name,
        join_code: joinCode,
        block_set_id: blockSetId,
      },
      {
        headers: {
          authorization: `Bearer ${this.user$.value?.access_token}`,
        },
      },
    );
  }

  joinGroup(joinCode: string) {
    const { hostname } = this.envService.getEnvConfig();
    return this.http.post<UserGroup[]>(
      `${hostname}/me/groups`,
      {
        join_code: joinCode,
      },
      {
        headers: {
          authorization: `Bearer ${this.user$.value?.access_token}`,
        },
      },
    );
  }
}
