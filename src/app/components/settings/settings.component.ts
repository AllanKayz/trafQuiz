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
    MatSelectModule
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
      theme: [settings.theme || 'light'],
      notifications: [settings.notifications ?? true],
      compactMode: [settings.compactMode ?? false]
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      const data = { title: 'Invalid', message: 'Please fix errors before saving', type: 'error', buttons: [{ text: 'Ok', value: 'close' }] };
      this.service.openAlertDialog(data);
      return;
    }

    if (this.profileForm.value.changePassword) {
      if (this.profileForm.value.password !== this.profileForm.value.confirmPassword) {
        const data = { title: 'Password mismatch', message: 'Passwords do not match', type: 'error', buttons: [{ text: 'Ok', value: 'close' }] };
        this.service.openAlertDialog(data);
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
        const data = { title: 'Saved', message: 'Profile updated', type: 'success', buttons: [{ text: 'Close', value: 'close' }] };
        this.service.openAlertDialog(data);
        this.saving = false;
      },
      error: () => {
        const data = { title: 'Error', message: 'Unable to save profile', type: 'error', buttons: [{ text: 'Close', value: 'close' }] };
        this.service.openAlertDialog(data);
        this.saving = false;
      }
    });
  }

  savePreferences() {
    const prefs = this.prefsForm.value;
    this.service.updatePreferences(prefs);
    const data = { title: 'Saved', message: 'Preferences updated', type: 'success', buttons: [{ text: 'Close', value: 'close' }] };
    this.service.openAlertDialog(data);
  }
}

