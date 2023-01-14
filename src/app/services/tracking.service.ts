/**
 * This service enables the tracking of user activity within the application.
 * 
 * The current implementation uses Matomo. While the @ngx-matomo library offers
 * ways to track activity directly from component templates, we're adding this
 * wrapper in case we later replace Matomo.
 */
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';

import { MatomoTracker } from '@ngx-matomo/tracker';

import { Block, Molecule, User } from '../models';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  constructor(
    private readonly tracker: MatomoTracker,
    private router: Router,
    private userService: UserService
  ) {
    this.startAutoTrackNavigation();
    this.startAutoUpdateUser();
  }

  private startAutoTrackNavigation(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd) // just for the typing below
    ).subscribe(
      (navEnd) => {
        this.trackNavigation(navEnd.url);
      }
    );
  }

  private trackNavigation(url: string): void {
    this.tracker.trackPageView(url);
  }

  private startAutoUpdateUser(): void {
    this.userService.getUser().subscribe(
      user => {
        this.tracker.setUserId(user?.surveyCode || 'none')
      }
    );
  }

  trackBeginSession(user: User | null): void {

  }

  trackRestoreWorkspace(): void {

  }

  trackClickCatalogTab(tab: 'blocks' | 'molecules'): void {

  }

  trackClickCatalogSubtab(subtab: 'start' | 'middle' | 'end'): void {

  }

  trackSearch(): void {

  }

  trackFilter(): void {

  }

  trackAddMoleculeToCart(): void {

  }

  trackRemoveMoleculeFromCart(): void {

  }

  trackStartWorkspaceMolecule(method: 'drag' | 'click'): void {

  }

  trackUpdateWorkspaceMolecule(method: 'drag' | 'click' | 'block-delete-button'): void {

  }

  trackDeleteWorkspaceMolecule(method: 'molecule-delete-button'): void {

  }

  trackOpenOverlay(blockOrMolecule: Block | Molecule): void {

  }

  trackShowMoreMoleculePropertiesInOverlay(blockOrMolecule: Block | Molecule): void {

  }

  trackCloseOverlay(blockOrMolecule: Block | Molecule, method: 'close-button' | 'background-click' | 'auto') {

  }

  trackOpenCart(): void {

  }

  trackCloseCart(): void {

  }

  trackMouseEnter(): void {

  }

  trackMouseLeave(): void {

  }

  /*
  trackClick(target): void {
    this.tracker.trackEvent(category, action, name, value)
  }

  trackDragAndDrop(): void {
    this.tracker.trackEvent(category, action, name, value)
  }
  */
}

/** Prajakt's original request
 * All mouse activity-related frequency and coordinate-data
More specifically; 
	Number of clicks
	Position of clicks (if possible, tagged with the Area of Interest - e.g. 
workspace, Molecule/block, tab catalogue, )
	Sequence of clicks (if possible, logged Area-of-interest-wise, for instance, to determine transitions across the different UI elements)
Drag and drop actions
	Position of drag and drop actions
	Overall mouse movement

 */