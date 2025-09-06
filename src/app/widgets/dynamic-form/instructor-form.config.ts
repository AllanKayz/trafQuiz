import { Validators } from '@angular/forms';
import { FormField } from './dynamic-form.component';

export const INSTRUCTOR_FORM_FIELDS: FormField[] = [
  {
    key: 'name',
    label: 'Full Name',
    type: 'text',
    validators: [Validators.required],
    colspan: 2
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    validators: [Validators.required, Validators.email],
    colspan: 2
  },
  {
    key: 'specialization',
    label: 'Specialization',
    type: 'select',
    validators: [Validators.required],
    options: [
      { value: 'beginner', label: 'Beginner Courses' },
      { value: 'advanced', label: 'Advanced Driving' },
      { value: 'commercial', label: 'Commercial License' }
    ]
  },
  {
    key: 'yearsExperience',
    label: 'Years of Experience',
    type: 'number',
    validators: [Validators.min(1)]
  },
  {
    key: 'certification',
    label: 'Certification Number',
    type: 'text',
    validators: [Validators.required]
  },
  {
    key: 'available',
    label: 'Currently Available',
    type: 'checkbox',
    defaultValue: true
  }
];
