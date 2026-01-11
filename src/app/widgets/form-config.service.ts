import { Injectable, computed, inject, signal } from '@angular/core';
import { FormField, FieldType } from './dynamic-form/dynamic-form.component';
import { Validators } from '@angular/forms';
import { TraffiquizService } from '../traffiquiz.service';

@Injectable({ providedIn: 'root' })
export class FormConfigService {
  private trafQuiz = inject(TraffiquizService);

  public formConfigs = computed<Record<string, FormField[]>>(() => ({
    question: [
      {
        key: 'question',
        label: 'Question Text',
        type: 'textarea',
        validators: [Validators.required, Validators.maxLength(500)],
        colspan: 2,
        icon: 'help_outline',
        hint: 'Enter the main text of the question.'
      },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        validators: [Validators.required],
        options: [
          { value: 'rules', label: 'Traffic Rules' },
          { value: 'signs', label: 'Road Signs' },
          { value: 'safety', label: 'Safety' }
        ],
        icon: 'category'
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'radio',
        validators: [Validators.required],
        options: [
          { value: 'easy', label: 'Easy' },
          { value: 'medium', label: 'Medium' },
          { value: 'hard', label: 'Hard' }
        ],
        defaultValue: 'easy',
        hint: 'Set the complexity level for the student.'
      },
      {
        key: 'hasImage',
        label: 'Includes Image',
        type: 'checkbox',
        defaultValue: false,
        hint: 'Check if this question requires a visual aid.'
      },
      {
        key: 'photo',
        label: 'Question Image',
        type: 'file',
        hidden: true,
        icon: 'image'
      },
      {
        key: 'option_a',
        label: 'Option 1',
        type: 'text',
        validators: [Validators.required],
        defaultValue: '',
        icon: 'looks_one'
      },
      {
        key: 'option_b',
        label: 'Option 2',
        type: 'text',
        validators: [Validators.required],
        defaultValue: '',
        icon: 'looks_two'
      },
      {
        key: 'option_c',
        label: 'Option 3',
        type: 'text',
        validators: [Validators.required],
        defaultValue: '',
        icon: 'looks_3'
      },
      {
        key: 'answer',
        label: 'Correct Option',
        type: 'select',
        validators: [Validators.required],
        options: [
          { value: 0, label: 'Option 1' },
          { value: 1, label: 'Option 2' },
          { value: 2, label: 'Option 3' }
        ],
        defaultValue: 0,
        icon: 'check_circle',
        hint: 'Select which of the above options is the correct answer.'
      }
    ],
    category: [
      {
        key: 'category',
        label: 'Category',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'label'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        colspan: 2,
        icon: 'description'
      },
    ],
    specialization: [
      {
        key: 'specialization',
        label: 'Specialization',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'stars'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        colspan: 2,
        icon: 'description'
      },
    ],
    certification: [
      {
        key: 'certification',
        label: 'Certification',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'verified'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        colspan: 2,
        icon: 'description'
      },
    ],
    student: [
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'person'
      },
      {
        key: 'lastName',
        label: 'Last Name',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'person_outline'
      },
      {
        key: 'username',
        label: 'User Name',
        type: 'text',
        validators: [Validators.required],
        colspan: 1,
        icon: 'account_circle'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        validators: [Validators.required, Validators.email],
        colspan: 2,
        icon: 'mail'
      },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'text',
        validators: [Validators.pattern(/^\+263[0-9]{9}$/)],
        placeholder: '+263772000111',
        icon: 'phone',
        hint: 'Formatted as +263 followed by 9 digits.'
      },
      {
        key: 'address',
        label: 'Address',
        type: 'textarea',
        colspan: 2,
        icon: 'home'
      },
      {
        key: 'enrollmentDate',
        label: 'Enrollment Date',
        type: 'date',
        validators: [Validators.required],
        icon: 'calendar_today'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        validators: [Validators.required, Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
        colspan: 2,
        icon: 'lock',
        hint: 'Use 8+ characters with uppercase, number, and special character.'
      },
      {
        key: 'confirmpassword',
        label: 'Confirm Password',
        type: 'password',
        validators: [Validators.required, Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
        colspan: 2,
        icon: 'lock_reset'
      },
      {
        key: 'active',
        label: 'Active Student',
        type: 'checkbox',
        defaultValue: true,
        hint: 'Determine if the student has system access.'
      }
    ],
    instructor: [
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'person'
      },
      {
        key: 'lastName',
        label: 'Last Name',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'person_outline'
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        validators: [Validators.required],
        colspan: 2,
        icon: 'account_circle'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        validators: [Validators.required, Validators.email],
        colspan: 2,
        icon: 'mail'
      },
      {
        key: 'license',
        label: "Driver's License Number",
        type: 'text',
        validators: [Validators.required],
        placeholder: 'FFF 45666 J',
        icon: 'badge'
      },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'text',
        validators: [Validators.required, Validators.pattern(/^\+263[0-9]{9}$/)],
        placeholder: '+263772000111',
        icon: 'phone'
      },
      {
        key: 'specialization',
        label: 'Specialization',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('specialization'),
        icon: 'stars'
      },
      {
        key: 'experience',
        label: 'Years of Experience',
        type: 'number',
        validators: [Validators.min(1)],
        icon: 'timeline'
      },
      {
        key: 'certification',
        label: 'Certification',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('certification'),
        icon: 'verified'
      },
      {
        key: 'available',
        label: 'Currently Available',
        type: 'checkbox',
        defaultValue: true,
        hint: 'Toggle instructor availability for scheduling.'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        validators: [Validators.required, Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
        colspan: 2,
        icon: 'lock'
      },
    ],
    payment: [
      {
        key: 'package',
        label: 'Select Package',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('package'),
        icon: 'inventory_2',
        hint: 'Choose the lesson package you wish to pay for.'
      },
      {
        key: 'amount',
        label: 'Amount to Pay',
        type: 'number',
        validators: [Validators.required, Validators.min(1)],
        icon: 'monetization_on',
        hint: 'Verify the amount before proceeding.'
      },
      {
        key: 'method',
        label: 'Payment Method',
        type: 'radio',
        validators: [Validators.required],
        options: [
          { value: 'card', label: 'Credit/Debit Card' },
          { value: 'ecocash', label: 'EcoCash' },
          { value: 'onemoney', label: 'OneMoney' },
          { value: 'cash', label: 'Cash' }
        ],
        defaultValue: 'card',
        icon: 'payment'
      },
      {
        key: 'notes',
        label: 'Payment Notes (Optional)',
        type: 'textarea',
        colspan: 2,
        icon: 'note_add'
      }
    ],
    'admin-payment': [
      {
        key: 'isNewStudent',
        label: 'New Student Enrollment',
        type: 'checkbox',
        defaultValue: false,
        hint: 'Check this if the student is not yet in the system.',
        colspan: 2
      },
      {
        key: 'studentId',
        label: 'Select Existing Student',
        type: 'select',
        options: this.getOptions('student'),
        icon: 'person',
        hint: 'Only required for existing students.',
        colspan: 2
      },
      {
        key: 'firstName',
        label: 'First Name',
        type: 'text',
        icon: 'person',
        hint: 'Required for new students.'
      },
      {
        key: 'lastName',
        label: 'Last Name',
        type: 'text',
        icon: 'person_outline',
        hint: 'Required for new students.'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        icon: 'mail',
        hint: 'Required for new students.'
      },
      {
        key: 'phone',
        label: 'Phone',
        type: 'text',
        icon: 'phone',
        hint: 'Required for new students.'
      },
      {
        key: 'username',
        label: 'Username',
        type: 'text',
        icon: 'account_circle',
        hint: 'Required for new students.'
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        icon: 'lock',
        hint: 'Required for new students (Default: Student123!)',
        defaultValue: 'Student123!'
      },
      {
        key: 'address',
        label: 'Address',
        type: 'textarea',
        icon: 'home',
        colspan: 2,
        hint: 'Required for new students.'
      },
      {
        key: 'packageId',
        label: 'Select Package',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('package'),
        icon: 'inventory_2',
        hint: 'Choose the lesson package.',
        colspan: 2
      },
      {
        key: 'amount',
        label: 'Amount to Pay',
        type: 'number',
        validators: [Validators.required, Validators.min(1)],
        icon: 'monetization_on',
        hint: 'Verify the amount before proceeding.'
      },
      {
        key: 'method',
        label: 'Payment Method',
        type: 'radio',
        validators: [Validators.required],
        options: [
          { value: 'card', label: 'Credit/Debit Card' },
          { value: 'ecocash', label: 'EcoCash' },
          { value: 'onemoney', label: 'OneMoney' },
          { value: 'cash', label: 'Cash' }
        ],
        defaultValue: 'card',
        icon: 'payment'
      },
      {
        key: 'notes',
        label: 'Payment Notes (Optional)',
        type: 'textarea',
        colspan: 2,
        icon: 'note_add'
      }
    ],
    'book-lesson': [
      {
        key: 'title',
        label: 'Lesson Title',
        type: 'text',
        validators: [Validators.required],
        placeholder: 'e.g., Highway Driving Practice',
        icon: 'title'
      },
      {
        key: 'subject',
        label: 'Subject',
        type: 'select',
        validators: [Validators.required],
        options: [
          { value: 'Practical', label: 'Practical driving' },
          { value: 'Traffic Rules', label: 'Traffic Rules' },
          { value: 'Safety', label: 'Safety' },
          { value: 'Theory', label: 'Theory' }
        ],
        icon: 'subject'
      },
      {
        key: 'startTime',
        label: 'Preferred Date & Time',
        type: 'date',
        validators: [Validators.required],
        icon: 'calendar_today'
      },
      {
        key: 'instructorId',
        label: 'Instructor',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('instructor'),
        icon: 'person'
      },
      {
        key: 'notes',
        label: 'Additional Notes',
        type: 'textarea',
        colspan: 2,
        icon: 'notes'
      }
    ],
    'admin-salary': [
      {
        key: 'instructorId',
        label: 'Instructor',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('instructor'),
        icon: 'person'
      },
      {
        key: 'amount',
        label: 'Salary Amount',
        type: 'number',
        validators: [Validators.required, Validators.min(1)],
        icon: 'attach_money'
      },
      {
        key: 'method',
        label: 'Payment Method',
        type: 'radio',
        validators: [Validators.required],
        options: [
          { value: 'cash', label: 'Cash' },
          { value: 'bank_transfer', label: 'Bank Transfer' },
          { value: 'ecocash', label: 'EcoCash' }
        ],
        defaultValue: 'cash',
        icon: 'payments'
      },
      {
        key: 'notes',
        label: 'Notes',
        type: 'textarea',
        colspan: 2,
        icon: 'note'
      }
    ],
    'admin-expense': [
      {
        key: 'category',
        label: 'Expense Category',
        type: 'select',
        validators: [Validators.required],
        options: [
          { value: 'maintenance', label: 'Vehicle Maintenance' },
          { value: 'fuel', label: 'Fuel' },
          { value: 'tc_expense', label: 'T&C Expense' },
          { value: 'other', label: 'Other' }
        ],
        icon: 'category'
      },
      {
        key: 'vehicleId',
        label: 'Associated Vehicle (Optional)',
        type: 'select',
        options: this.getOptions('vehicle'),
        icon: 'directions_car'
      },
      {
        key: 'amount',
        label: 'Expense Amount',
        type: 'number',
        validators: [Validators.required, Validators.min(1)],
        icon: 'attach_money'
      },
      {
        key: 'method',
        label: 'Payment Method',
        type: 'radio',
        validators: [Validators.required],
        options: [
          { value: 'cash', label: 'Cash' },
          { value: 'bank_transfer', label: 'Bank Transfer' },
          { value: 'card', label: 'Company Card' }
        ],
        defaultValue: 'cash',
        icon: 'payments'
      },
      {
        key: 'notes',
        label: 'Notes/Description',
        type: 'textarea',
        colspan: 2,
        icon: 'note'
      }
    ]
  }));

  packageData: any = this.trafQuiz.packages;

  constructor() {
    this.trafQuiz.getPackages(); // Fetch packages
    //this.trafQuiz.getSpecializations();
  }

  getOptions(feildKey: string) {
    let options: any[] = [];
    switch (feildKey) {
      case 'category':
        options = [
          { value: 'rules', label: 'Traffic Rules' },
          { value: 'signs', label: 'Road Signs' },
          { value: 'safety', label: 'Safety' }
        ];
        break;
      case 'package':
        options = this.trafQuiz.packages();
        break;
      case 'specialization':
        options = this.trafQuiz.specializations();
        break;
      case 'certification':
        options = this.trafQuiz.certifications();
        break;
      case 'instructor':
        options = this.trafQuiz.instructorsSignal().map(i => ({
          value: i.id,
          label: i.firstName + ' ' + i.lastName
        }));
        break;
      case 'student':
        options = this.trafQuiz.studentsSignal().map(s => ({
          value: s.id,
          label: s.firstName + ' ' + s.lastName
        }));
        break;
      case 'vehicle':
        options = this.trafQuiz.vehiclesSignal().map(v => ({
          value: v.id,
          label: `${v.make} ${v.model} (${v.registration})`
        }));
        break;
    }

    return options;
  }

  getFormConfig(formType: string): FormField[] {
    return this.formConfigs()[formType] || [];
  }

  updateFormConfig(formType: string, fields: FormField[]) {
    console.warn('updateFormConfig is disabled as formConfigs is now computed.');
  }

  addFieldToConfig(formType: string, field: FormField) {
    console.warn('addFieldToConfig is disabled as formConfigs is now computed.');
  }
}
