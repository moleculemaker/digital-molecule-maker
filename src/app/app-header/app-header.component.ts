import { Component, HostListener, OnInit } from '@angular/core';
import { GUEST_USER, UserService } from '../services/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  title$ = of('');

  menuOpen = false;

  @HostListener('document:click', [])
  closeMenu() {
    this.menuOpen = false;
  }

  constructor(
    private userService: UserService,
    private cartService: CartService,
    private router: Router,
  ) {
    this.updateTitle(router.url);
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.updateTitle(e.url);
      }
    });
  }

  private updateTitle(url: string) {
    if (!url.endsWith('/build')) {
      this.title$ = of('');
    } else if (url.startsWith('/library/')) {
      this.title$ = this.userService.user$.pipe(
        map((user) =>
          user
            ? user.username === GUEST_USER
              ? 'Guest Workspace'
              : `${user.name}'s Workspace`
            : '',
        ),
      );
    } else {
      this.title$ = this.cartService.group$.pipe(
        map((group) => (group ? `${group.creator!.name}'s Classroom` : '')),
      );
    }
  }

  get user$() {
    return this.userService.user$;
  }

  //********************************************
  ngOnInit(): void {}

  onShowTutorial() {
    //todo: hook this up to the tutorial
  }

  goToGroupsPage() {
    this.router.navigateByUrl('/groups');
  }

  goToBlockLibrary() {
    this.router.navigateByUrl('/library');
  }

  logout() {
    this.userService.logout();
  }

  protected readonly GUEST_USER = GUEST_USER;
}
