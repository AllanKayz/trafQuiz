import { Validators } from '@angular/forms';
import { FormField } from './dynamic-form.component';

export const CATEGORY_FORM_FIELDS: FormField[] = [
    {
        key: 'category',
        label: 'Category',
        type: 'text',
        validators: [Validators.required],
        colspan: 2
    }
]