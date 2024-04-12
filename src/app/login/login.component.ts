import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EnvironmentService } from '../services/environment.service';
import { User } from '../models';
import { UserService } from '../services/user.service';
import { Message } from 'primeng/api';

@Component({
  selector: 'dmm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  name = '';
  username = '';
  password = '';
  passwordConfirmed = '';

  isLogin = true;

  errorMessages: Message[] = [];

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.url.subscribe((urlSegments) => {
      this.isLogin = urlSegments[0]?.path == 'login';
    });
  }

  login() {
    const { hostname } = this.envService.getEnvConfig();
    this.http
      .post<User>(hostname + '/auth/login', {
        username: this.username,
        password: this.password,
      })
      .subscribe(
        (user) => {
          this.userService.setUser(user);
          this.router.navigateByUrl('/library');
        },
        (res: HttpErrorResponse) => {
          this.errorMessages = [
            { severity: 'error', detail: res.error.detail || res.statusText },
          ];
        },
      );
  }

  signup() {
    const { hostname } = this.envService.getEnvConfig();
    if (this.password !== this.passwordConfirmed) {
      this.errorMessages = [
        { severity: 'error', detail: `Passwords don't match` },
      ];
      return;
    }
    this.http
      .post<User>(hostname + '/auth/register', {
        name: this.name,
        username: this.username,
        password: this.password,
      })
      .subscribe(
        (user) => {
          this.userService.setUser(user);
          this.router.navigateByUrl('/library');
        },
        (res: HttpErrorResponse) => {
          this.errorMessages = [
            { severity: 'error', detail: res.error.detail || res.statusText },
          ];
        },
      );
  }
}
