import { Component, input, Output, EventEmitter, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormGroup, FormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TraffiquizService } from '../../traffiquiz.service';
import { from } from 'rxjs';


export type FieldType =
  'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'time' | 'file';

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: any, label: string }[];
  validators?: any[];
  defaultValue?: any;
  placeholder?: string;
  colspan?: number;
  hidden?: boolean;
  icon?: string;
  hint?: string;
  dependsOn?: {
    field: string;
    value: any;
  };
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatIconModule,
    MatDialogModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent {
  private selectedFile?: File;
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject(MatDialogRef, { optional: true });
  private trafQuiz = inject(TraffiquizService);

  // Input properties with defaults
  // Input properties with defaults using signal inputs
  fields = input<FormField[]>(this.data?.fields || []);
  title = input<string>(this.data?.title || '');
  submitText = input<string>(this.data?.submitText || 'Submit');
  cancelText = input<string>(this.data?.cancelText || 'Cancel');
  initialData = input<any>(this.data?.initialData || {});
  isSubmitting = input<boolean>(false);

  // Form state
  form = computed(() => {
    const group: any = {};
    const fields = this.fields();
    const initialData = this.initialData();

    fields.forEach((field: any) => {
      const validators = field.validators || [];
      const defaultValue = initialData[field.key] ?? field.defaultValue ?? '';

      group[field.key] = this.fb.control(defaultValue, validators);
    });

    return this.fb.group(group);
  });

  formValues = toSignal(this.form().valueChanges, { initialValue: this.form().value });

  loading = signal(false);
  error = signal('');

  // Computed properties
  groupedFields = computed(() => {
    this.formValues(); // Track changes
    const fields = this.fields();
    const form = this.form();
    const visibleFields = fields.filter(field => {
      if (field.dependsOn) {
        const dependentValue = form.get(field.dependsOn.field)?.value;
        return dependentValue === field.dependsOn.value;
      }
      return !field.hidden;
    });

    const groups = [];
    for (let i = 0; i < visibleFields.length; i++) {
      groups.push([visibleFields[i]]);
    }

    return groups;
  });

  // Output events
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  constructor() { }


  onSubmit() {
    if (this.form().invalid) {
      this.form().markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.submitted.emit(this.form().value);
  }

  onCancel() {
    this.cancelled.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (!file) return;

    this.loading.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result;
      from(window.electronAPI.invoke('upload-attachment', {
        name: file.name,
        type: file.type,
        data: buffer
      })).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.form().get(key)?.setValue(res.url);
          } else {
            this.error.set(res.message || 'Error uploading file');
          }
          this.loading.set(false);
        },
        error: (err: any) => {
          this.error.set('Error uploading file');
          this.loading.set(false);
        }
      });
    };
    reader.readAsArrayBuffer(file);
  }

  getFieldControl(key: string) {
    return this.form().get(key);
  }

  isFieldInvalid(key: string) {
    const control = this.getFieldControl(key);
    return control?.invalid && (control?.dirty || control?.touched);
  }

  getErrorMessage(key: string) {
    const control = this.getFieldControl(key);
    if (!control?.errors) return '';

    if (control.errors['required']) {
      return 'This field is required';
    }
    if (control.errors['email']) {
      return 'Invalid email format';
    }
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength}`;
    }
    if (control.errors['maxlength']) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength}`;
    }

    return 'Invalid value';
  }
}
