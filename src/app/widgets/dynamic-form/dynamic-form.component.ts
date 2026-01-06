import { Component, input, Output, EventEmitter, inject, signal, computed } from '@angular/core';

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


export type FieldType = 
  'text' | 'number' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  options?: {value: any, label: string}[];
  validators?: any[];
  defaultValue?: any;
  placeholder?: string;
  colspan?: number;
  hidden?: boolean;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatSelectModule, MatCheckboxModule, MatRadioModule, MatDatepickerModule, MatIconModule, MatDialogModule, MatNativeDateModule],
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent  {
  private selectedFile?: File;
  private fb = inject(FormBuilder);
  private data = inject(MAT_DIALOG_DATA);

  // Input signals
  fields = input<FormField[]>(this.data.fields);
  title = input(this.data.title);
  submitText = input(this.data.submitText);
  cancelText = input('Cancel');
  initialData = input<any>(this.data.initialData);

  // Form state
  form = signal<FormGroup>(this.fb.group({}));
  loading = signal(false);
  error = signal('');

  // Computed properties
  groupedFields = computed(() => {
    const cols = 1; // Default number of columns
    const fields = this.fields();
    const groups = [];
    
    for (let i = 0; i < fields.length; i += cols) {
      groups.push(fields.slice(i, i + cols));
    }
    
    return groups;
  });

  // Output events
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  
  constructor(public dialogRef: MatDialogRef<DynamicFormComponent>) {
    this.initializeForm();
  }

  private initializeForm() {
    const group: any = {};
    const fields = this.fields();
    const initialData = this.initialData();

    fields.forEach((field:any) => {
      const validators = field.validators || [];
      const defaultValue = initialData[field.key] ?? field.defaultValue ?? '';
      
      group[field.key] = [defaultValue, validators];
    });

    this.form.set(this.fb.group(group));
  }

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
    this.dialogRef.close();
  }
  
  onFileChange(event: any, key: any) {
	this.selectedFile = event.target.files[0];
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
