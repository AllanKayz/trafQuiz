import { Validators } from '@angular/forms';
import { FormField } from './dynamic-form.component';
import { TraffiquizService } from '../../traffiquiz.service';

export const STUDENT_FORM_FIELDS: FormField[] = [
  {
    key: 'firstName',
    label: 'First Name',
    type: 'text',
    validators: [Validators.required],
    colspan: 2
  },
  {
    key: 'lastName',
    label: 'Last Name',
    type: 'text',
    validators: [Validators.required],
    colspan: 2
  },
  {
    key: 'username',
    label: 'User Name',
    type: 'text',
    validators: [Validators.required],
    colspan: 1
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    validators: [Validators.required, Validators.email],
    colspan: 2
  },
  {
    key: 'phone',
    label: 'Phone Number',
    type: 'text',
    validators: [Validators.pattern(/^\+263[0-9]{9}$/)],
    placeholder: '+263772000111'
  },
  {
    key: 'address',
    label: 'Address',
    type: 'textarea',
    colspan: 2
  },
  {
    key: 'enrollmentDate',
    label: 'Enrollment Date',
    type: 'date',
    validators: [Validators.required]
  },
  {
    key: 'package',
    label: 'Package',
    type: 'select',
    validators: [Validators.required],
    options: [
      { value: 0, label: 'Option 1' },
      { value: 1, label: 'Option 2' },
      { value: 2, label: 'Option 3' }
    ],
    defaultValue: 0
  },
  {
    key: 'password',
    label: 'Password',
    type: 'password',
    validators: [Validators.required, Validators.min(8),Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
    colspan: 1
  },
  {
    key: 'confirmpassword',
    label: 'Confirm Password',
    type: 'password',
    validators: [Validators.required, Validators.min(8),Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
    colspan: 1
  },
  {
    key: 'active',
    label: 'Active Student',
    type: 'checkbox',
    defaultValue: true
  },
];
