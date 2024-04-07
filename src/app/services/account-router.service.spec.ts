import { TestBed } from '@angular/core/testing';

import { AccountRouterService } from './account-router.service';

describe('AccountRouterService', () => {
  let service: AccountRouterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountRouterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
