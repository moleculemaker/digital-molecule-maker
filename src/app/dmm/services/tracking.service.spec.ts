import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxMatomoTrackerModule } from '@ngx-matomo/tracker';

import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxMatomoTrackerModule.forRoot({
          siteId: 1,
          trackerUrl: 'https://moleculemaker.matomo.cloud/',
          disabled: true,
        }),
      ],
    });
    service = TestBed.inject(TrackingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
