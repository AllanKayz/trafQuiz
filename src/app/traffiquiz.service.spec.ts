import { TestBed } from '@angular/core/testing';
import { TraffiquizService } from './traffiquiz.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('TraffiquizService', () => {
  let service: TraffiquizService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule],
      providers: [TraffiquizService]
    });

    service = TestBed.inject(TraffiquizService);
    localStorage.clear();
    // Initialize user signal to avoid null errors in some tests
    service.userSignal.set({ role: 'admin', username: 'admin' });
  });

  afterEach(() => {
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

  it('updateProfile should update local storage and user signal', (done) => {
    localStorage.setItem('user', JSON.stringify({ username: 'old', role: 'admin' }));
    const spy = spyOn(window.electronAPI, 'invoke').and.returnValue(Promise.resolve({ success: true }));

    service.updateProfile({ username: 'new' }).subscribe(res => {
      expect(localStorage.getItem('user')).toContain('new');
      expect(service.userSignal()?.username).toBe('new');
      expect(spy).toHaveBeenCalledWith('update-user', jasmine.objectContaining({ username: 'new' }));
      done();
    });
  });

  it('currentUser computed signal should reflect userSignal', () => {
    const testUser = { name: 'Test', role: 'instructor' };
    service.userSignal.set(testUser);
    expect(service.currentUser()).toEqual(testUser);
  });
});
