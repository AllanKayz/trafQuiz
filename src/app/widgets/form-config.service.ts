import { Injectable, computed, inject, signal } from '@angular/core';
import { FormField, FieldType } from './dynamic-form/dynamic-form.component';
import { Validators } from '@angular/forms';
import { TraffiquizService } from '../traffiquiz.service';

@Injectable({ providedIn: 'root' })
export class FormConfigService {
  private trafQuiz = inject(TraffiquizService);

  private formConfigs = signal<Record<string, FormField[]>>({
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
        key: 'package',
        label: 'Package',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('package'),
        defaultValue: 0,
        icon: 'inventory_2'
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
    ]
  });

  packageData: any = this.trafQuiz.packages;

  constructor() {
    this.trafQuiz.getPackages(); // Fetch packages
    //this.trafQuiz.getSpecializations();
  }

  getOptions(feildKey: string) {
    const pkgOptions = localStorage['packages'];
    const questionCategories = localStorage['questionCategories'];
    const specializationOptions = localStorage['specializations'];
    const certificationOptions = localStorage['certifications'];

    let specializationD = this.trafQuiz.specializations;

    let options: any = [];
    switch (feildKey) {
      case 'category':
        options = [{ value: 'rules', label: 'Traffic Rules' }, { value: 'signs', label: 'Road Signs' }, { value: 'safety', label: 'Safety' }];
        break;
      case 'package':
        options = JSON.parse(pkgOptions);
        break;
      case 'specialization':
        options = JSON.parse(specializationOptions);
        break;
      case 'certification':
        options = JSON.parse(certificationOptions);
        break;
      case 'instructor':
        options = this.trafQuiz.instructorsSignal().map(i => ({ value: i.id, label: i.firstName + ' ' + i.lastName }));
        break;
    }

    return options;
  }

  getFormConfig(formType: string): FormField[] {
    return this.formConfigs()[formType] || [];
  }

  updateFormConfig(formType: string, fields: FormField[]) {
    this.formConfigs.update(configs => ({
      ...configs,
      [formType]: fields
    }));
  }

  addFieldToConfig(formType: string, field: FormField) {
    this.formConfigs.update(configs => ({
      ...configs,
      [formType]: [...(configs[formType] || []), field]
    }));
  }
}
