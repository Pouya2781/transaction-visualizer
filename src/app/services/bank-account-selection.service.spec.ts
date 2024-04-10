import { TestBed } from '@angular/core/testing';

import { BankAccountSelectionService } from './bank-account-selection.service';

describe('BankAccountSelectionService', () => {
  let service: BankAccountSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankAccountSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
