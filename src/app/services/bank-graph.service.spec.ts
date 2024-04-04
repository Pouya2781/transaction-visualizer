import { TestBed } from '@angular/core/testing';

import { BankGraphService } from './bank-graph.service';

describe('BankGraphService', () => {
  let service: BankGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BankGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
