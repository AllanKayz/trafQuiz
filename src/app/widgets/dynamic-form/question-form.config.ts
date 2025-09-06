import { Validators } from '@angular/forms';
import { FormField } from './dynamic-form.component';

export const QUESTION_FORM_FIELDS: FormField[] = [
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
  }
];

export const QUESTION_OPTION_FIELDS: FormField[] = [
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
];
