import { TestBed } from '@angular/core/testing';

import { LiteModeService } from './lite-mode.service';

describe('LiteModeService', () => {
  let service: LiteModeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LiteModeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
