import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { SettingsComponent } from './settings.component';
import { TraffiquizService } from '../../traffiquiz.service';
import { signal, computed } from '@angular/core';

class MockService {
  userSignal = signal({ role: 'student', username: 'tester', email: 'a@b.com', firstName: 'Test', lastName: 'User' });
  currentUser = computed(() => this.userSignal());
  getRawUser() { return this.userSignal(); }
  updateProfile(payload: any) { return of(payload); }
  updatePreferences(prefs: any) { return prefs; }
  showNotification(msg: string, type: string) {}
  openAlertDialog(_: any) { return null; }
}

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let svc: TraffiquizService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [
        { provide: TraffiquizService, useClass: MockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    svc = TestBed.inject(TraffiquizService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate profile form from service', () => {
    expect(component.profileForm.value.username).toBe('tester');
    expect(component.profileForm.value.email).toBe('a@b.com');
  });

  it('should save profile and call service', fakeAsync(() => {
    const spy = spyOn(svc, 'updateProfile').and.callThrough();
    const firstNameControl = component.profileForm.get('firstName');
    firstNameControl?.setValue('New');
    firstNameControl?.markAsDirty();
    component.saveProfile();
    tick();
    expect(spy).toHaveBeenCalled();
  }));

  it('should save preferences locally', () => {
    const spy = spyOn(svc, 'updatePreferences').and.callThrough();
    (component.prefsForm.controls as any).theme.setValue('dark');
    component.savePreferences();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ theme: 'dark' }));
  });
});
