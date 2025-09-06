import { TestBed } from '@angular/core/testing';

import { ButtonConfigService } from './button-config.service';

describe('ButtonConfigService', () => {
  let service: ButtonConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ButtonConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
