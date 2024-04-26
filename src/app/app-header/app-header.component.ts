import { Component, HostListener, OnInit } from '@angular/core';
import { GUEST_USER, UserService } from '../services/user.service';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { WorkspaceService } from '../services/workspace.service';

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
    private workspaceService: WorkspaceService,
    private router: Router,
  ) {
    this.updateTitle(router.url);
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.updateTitle(e.url);
      }
    });
  }

  confirmationModalOpen = false;

  pendingAction: (() => void) | null = null;

  private requestMenuAction(action: () => void) {
    const isWorkspace =
      location.pathname !== '/library' && location.pathname !== '/groups';
    if (isWorkspace) {
      this.pendingAction = action;
      this.confirmationModalOpen = true;
    } else {
      action();
    }
  }

  proceed() {
    this.confirmationModalOpen = false;
    this.pendingAction?.();
  }

  cancel() {
    this.confirmationModalOpen = false;
    this.pendingAction = null;
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
      this.title$ = this.workspaceService.group$.pipe(
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
    this.requestMenuAction(() => this.router.navigateByUrl('/groups'));
  }

  goToBlockLibrary() {
    this.requestMenuAction(() => this.router.navigateByUrl('/library'));
  }

  logout() {
    this.requestMenuAction(() => this.userService.logout());
  }

  protected readonly GUEST_USER = GUEST_USER;
}
