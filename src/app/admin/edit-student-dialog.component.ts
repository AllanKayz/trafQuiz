import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-edit-student-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Update Student Details</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <input type="hidden" formControlName="updateUid">
        
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>First Name</mat-label>
          <input matInput formControlName="updateFirstName" required>
          <mat-error *ngIf="form.get('updateFirstName')?.hasError('required')">
            First name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Last Name</mat-label>
          <input matInput formControlName="updateLastName" required>
          <mat-error *ngIf="form.get('updateLastName')?.hasError('required')">
            Last name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Username</mat-label>
          <input matInput formControlName="updateUsername" required>
          <mat-error *ngIf="form.get('updateUsername')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="updateEmail" required>
          <mat-error *ngIf="form.get('updateEmail')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="form.get('updateEmail')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="updatePassword">
          <mat-hint>Leave blank to keep current password</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Close</button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!form.valid">Update</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 400px;
    }
    
    .w-100 {
      width: 100%;
    }
    
    mat-dialog-content {
      padding: 20px;
    }
  `]
})
export class EditStudentDialogComponent {
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<EditStudentDialogComponent>);
  data = inject(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    updateUid: [''],
    updateFirstName: ['', Validators.required],
    updateLastName: ['', Validators.required],
    updateUsername: ['', Validators.required],
    updateEmail: ['', [Validators.required, Validators.email]],
    updatePassword: ['']
  });

  constructor() {
    if (this.data) {
      this.form.patchValue({
        updateUid: this.data.id || '',
        updateFirstName: this.data.firstName || '',
        updateLastName: this.data.lastName || '',
        updateUsername: this.data.username || '',
        updateEmail: this.data.email || ''
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
