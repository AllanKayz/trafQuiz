import { Component, inject, signal } from '@angular/core';
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
  saving = signal(false);
  activeTab = signal('profile');

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

    const payload: any = {};
    const formControls = this.profileForm.controls;

    // Only include fields that have been modified
    if (formControls['username'].dirty) payload.username = formControls['username'].value;
    if (formControls['firstName'].dirty) payload.firstName = formControls['firstName'].value;
    if (formControls['lastName'].dirty) payload.lastName = formControls['lastName'].value;
    if (formControls['email'].dirty) payload.email = formControls['email'].value;
    if (formControls['phone'].dirty) payload.phone = formControls['phone'].value;

    if (this.profileForm.value.changePassword) {
      payload.password = this.profileForm.value.password;
    }

    if (Object.keys(payload).length === 0) {
      this.service.showNotification('No changes made', 'info');
      return;
    }

    this.saving.set(true);
    this.service.updateProfile(payload).subscribe({
      next: () => {
        this.service.showNotification('Profile updated', 'success');
        this.saving.set(false);
      },
      error: () => {
        this.service.showNotification('Unable to save profile', 'error');
        this.saving.set(false);
      }
    });
  }

  savePreferences() {
    const prefs = this.prefsForm.value;
    this.service.updatePreferences(prefs);
    this.service.showNotification('Preferences updated', 'success');
  }

  deleteAccount() {
    // Use openAlertDialog for critical action requiring explicit acknowledgment
    const dialogRef = this.service.openAlertDialog({
      title: 'Delete Account',
      message: 'Are you absolutely sure? This action cannot be undone and will permanently delete all your data.',
      type: 'error',
      buttons: [
        { text: 'Cancel', value: 'cancel', color: 'primary' },
        { text: 'Delete My Account', value: 'confirm', color: 'warn' }
      ]
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        // Open password confirmation dialog
        const dialogConfig = {
          width: '400px',
          data: {
            title: 'Confirm with Password',
            submitText: 'Delete Account',
            fields: [
              { name: 'password', label: 'Enter your password', type: 'password', required: true }
            ]
          }
        };

        // Import DynamicFormComponent and MatDialog
        import('../../widgets/dynamic-form/dynamic-form.component').then(({ DynamicFormComponent }) => {
          import('@angular/material/dialog').then(({ MatDialog }) => {
            const dialog = inject(MatDialog);
            const passwordDialogRef = dialog.open(DynamicFormComponent, dialogConfig);

            passwordDialogRef.componentInstance.submitted.subscribe((data: any) => {
              const user = this.service.getRawUser();
              this.service.deleteAccount(user?.id, data.password).subscribe({
                next: () => {
                  passwordDialogRef.close();
                  this.service.showNotification('Account deleted successfully', 'info');
                  // Service already logs out user
                },
                error: () => {
                  this.service.showNotification('Failed to delete account. Check password.', 'error');
                }
              });
            });
          });
        });
      }
    });
  }

}
