import { TestBed } from '@angular/core/testing';

import { AccountExpansionService } from './account-expansion.service';

describe('AccountExpansionService', () => {
  let service: AccountExpansionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccountExpansionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
