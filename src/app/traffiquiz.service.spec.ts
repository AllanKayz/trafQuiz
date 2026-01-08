import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TraffiquizService } from './traffiquiz.service';

describe('TraffiquizService', () => {
  let service: TraffiquizService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TraffiquizService]
    });

    service = TestBed.inject(TraffiquizService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('getRawUser should return parsed user or null', () => {
    expect(service.getRawUser()).toBeNull();
    localStorage.setItem('user', JSON.stringify({ username: 'x' }));
    expect(service.getRawUser()?.username).toBe('x');
  });

  it('updatePreferences should merge and store prefs', () => {
    localStorage.setItem('appSettings', JSON.stringify({ theme: 'light' }));
    const res = service.updatePreferences({ notifications: false });
    expect(res.theme).toBe('light');
    expect(res.notifications).toBe(false);
    expect(JSON.parse(localStorage.getItem('appSettings') || '{}').notifications).toBe(false);
  });

  it('updateProfile should update local storage and try backend', () => {
    localStorage.setItem('user', JSON.stringify({ username: 'old' }));
    service.updateProfile({ username: 'new' }).subscribe(res => {
      expect(localStorage.getItem('user')).toContain('new');
    });

    const req = httpMock.expectOne(r => r.url.includes('/updateuser'));
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });
});
