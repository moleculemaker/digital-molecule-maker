import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from '../services/environment.service';
import { User } from '../models';
import { UserService } from '../services/user.service';

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

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.route.url.subscribe((urlSegments) => {
      this.isLogin = urlSegments[0]?.path == 'signin';
    });
  }

  login() {
    const { hostname } = this.envService.getEnvConfig();
    this.http
      .post<User>(hostname + '/auth/login', {
        username: this.username,
        password: this.password,
      })
      .subscribe((user) => {
        this.userService.setUser(user);
        this.router.navigateByUrl('/groups');
      });
  }

  signup() {
    const { hostname } = this.envService.getEnvConfig();
    this.http
      .post<User>(hostname + '/auth/register', {
        name: this.name,
        username: this.username,
        password: this.password,
      })
      .subscribe((user) => {
        this.userService.setUser(user);
        this.router.navigateByUrl('/groups');
      });
  }

  navigateToBuild(): void {
    this.router.navigate(['build']);
  }
}
