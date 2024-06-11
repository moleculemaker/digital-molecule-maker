import { TestBed } from '@angular/core/testing';

import { WorkspaceService } from './workspace.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('WorkspaceService', () => {
  let service: WorkspaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(WorkspaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
