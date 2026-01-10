import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TraffiquizService } from '../../traffiquiz.service';

@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  public service = inject(TraffiquizService);
  private fb = new FormBuilder();

  profileForm: FormGroup;
  prefsForm: FormGroup;
  saving = false;
  activeTab = 'profile';

  constructor() {
    const raw = this.service.getRawUser() || {};

    this.profileForm = this.fb.group({
      username: [raw.username || '', Validators.required],
      firstName: [raw.firstname || raw.firstName || '', Validators.required],
      lastName: [raw.lastname || raw.lastName || ''],
      email: [raw.email || '', [Validators.required, Validators.email]],
      phone: [raw.phone || ''],
      changePassword: [false],
      password: [''],
      confirmPassword: ['']
    });

    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    this.prefsForm = this.fb.group({
      theme: [settings.theme || 'system'],
      notifications: [settings.notifications ?? true],
      compactMode: [settings.compactMode ?? false]
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.service.showNotification('Please fix errors before saving', 'error');
      return;
    }

    if (this.profileForm.value.changePassword) {
      if (this.profileForm.value.password !== this.profileForm.value.confirmPassword) {
        this.service.showNotification('Passwords do not match', 'error');
        return;
      }
    }

    const payload: any = {
      username: this.profileForm.value.username,
      firstname: this.profileForm.value.firstName,
      lastname: this.profileForm.value.lastName,
      email: this.profileForm.value.email,
      phone: this.profileForm.value.phone
    };

    if (this.profileForm.value.changePassword) {
      payload.password = this.profileForm.value.password;
    }

    this.saving = true;
    this.service.updateProfile(payload).subscribe({
      next: () => {
        this.service.showNotification('Profile updated', 'success');
        this.saving = false;
      },
      error: () => {
        this.service.showNotification('Unable to save profile', 'error');
        this.saving = false;
      }
    });
  }

  savePreferences() {
    const prefs = this.prefsForm.value;
    this.service.updatePreferences(prefs);
    this.service.showNotification('Preferences updated', 'success');
  }

  deleteAccount() {
    this.service.showConfirm('Are you sure you want to permanently delete your account?', 'DELETE').subscribe(() => {
      // Mock account deletion logic
      this.service.showNotification('Account deletion requested', 'info');
    });
  }
}

