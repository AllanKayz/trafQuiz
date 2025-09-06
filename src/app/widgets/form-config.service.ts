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
        colspan: 2
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
        ]
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
        defaultValue: 'easy'
      },
      {
        key: 'hasImage',
        label: 'Includes Image',
        type: 'checkbox',
        defaultValue: false
      },
      {
        key: 'photo',
        label: 'Question Image',
        type: 'file',
        hidden: true // Will be shown conditionally based on hasImage
      },
      {
        key: 'option_a',
        label: 'Option 1',
        type: 'text',
        validators: [Validators.required],
        defaultValue: ''
      },
      {
        key: 'option_b',
        label: 'Option 2',
        type: 'text',
        validators: [Validators.required],
        defaultValue: ''
      },
      {
        key: 'option_c',
        label: 'Option 3',
        type: 'text',
        validators: [Validators.required],
        defaultValue: ''
      },
      {
        key: 'answer',
        label: 'Correct Option',
        type: 'select',
        validators: [Validators.required],
        options: [
          { value: 0, label: 'Option 1' },
          { value: 1, label: 'Option 2' },
          { value: 1, label: 'Option 3' }
        ],
        defaultValue: 0
      }
    ],
    category: [
      {
        key: 'category',
        label: 'Category',
        type: 'text',
        validators: [Validators.required],
        colspan: 2
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        colspan: 2
      },
    ],
    specialization: [
      {
        key: 'specialization',
        label: 'Specialization',
        type: 'text',
        validators: [Validators.required],
        colspan: 2
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        colspan: 2
      },
    ],
    certification: [
      {
        key: 'certification',
        label: 'Certification',
        type: 'text',
        validators: [Validators.required],
        colspan: 2
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        colspan: 2
      },
    ],
    student: [
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
        options: this.getOptions('package'),
        defaultValue: 0
      },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        validators: [Validators.required, Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
        colspan: 2
      },
      {
        key: 'confirmpassword',
        label: 'Confirm Password',
        type: 'password',
        validators: [Validators.required, Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
        colspan: 2
      },
      {
        key: 'active',
        label: 'Active Student',
        type: 'checkbox',
        defaultValue: true
      }
    ],
    instructor: [
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
        label: 'Username',
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
		key: 'license',
		label: "Driver's License Number",
		type: 'text',
		validators: [Validators.required],
		placeholder: 'FFF 45666 J'
	  },
      {
        key: 'phone',
        label: 'Phone Number',
        type: 'text',
        validators: [Validators.required, Validators.pattern(/^\+263[0-9]{9}$/)],
        placeholder: '+263772000111'
      },
      {
        key: 'specialization',
        label: 'Specialization',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('specialization')
      },
      {
        key: 'experience',
        label: 'Years of Experience',
        type: 'number',
        validators: [Validators.min(1)]
      },
      {
        key: 'certification',
        label: 'Certification',
        type: 'select',
        validators: [Validators.required],
        options: this.getOptions('certification')
      },
      {
        key: 'available',
        label: 'Currently Available',
        type: 'checkbox',
        defaultValue: true
      },
	  {
        key: 'password',
        label: 'Password',
        type: 'password',
        validators: [Validators.required, Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)],
        colspan: 2
      },
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
