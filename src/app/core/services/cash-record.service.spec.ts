import { TestBed } from '@angular/core/testing';

import { CashRecordService } from './cash-record.service';

describe('CashRecordService', () => {
  let service: CashRecordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CashRecordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
