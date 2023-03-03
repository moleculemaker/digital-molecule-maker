import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'dmm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'Digital Molecule Maker';

  // TODO consider replacing this with nested routes to control
  // container elements
  showHeader$: Observable<boolean>;

  constructor(
    private router: Router
  ) {
    // show headers when we're not on the splash page
    this.showHeader$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => !['/', '/activity'].includes((event as NavigationEnd).url))
    );
  }

}
