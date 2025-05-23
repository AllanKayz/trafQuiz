import { TestBed } from '@angular/core/testing';

import { TraffiquizService } from './traffiquiz.service';

describe('TraffiquizService', () => {
  let service: TraffiquizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TraffiquizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
