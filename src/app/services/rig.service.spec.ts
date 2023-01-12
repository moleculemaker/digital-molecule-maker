import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RigService } from './rig.service';

describe('RigService', () => {
  let service: RigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(RigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
