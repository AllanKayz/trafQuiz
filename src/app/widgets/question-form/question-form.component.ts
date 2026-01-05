import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Question } from '../../trafquiz';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio'
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-question-form',
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatSelectModule, MatCheckboxModule, MatDialogModule, MatRadioModule, MatIconModule],
  templateUrl: './question-form.component.html',
  styleUrl: './question-form.component.css'
})
export class QuestionFormComponent {
  question!: Question;
  isEdit = false;

  constructor(public dialogRef: MatDialogRef<QuestionFormComponent>, @Inject(MAT_DIALOG_DATA) public data: { question?: Question }) {
    this.question = data.question || {
      id: 0,
      question: '',
      options: ['', '', ''],
      correct: 0,
      hasImage: false,
      flagged: false
    };
    this.isEdit = !!data.question;
  }

  addOption() {
    this.question.options.push('');
  }

  removeOption(index: number) {
    this.question.options.splice(index, 1);
    if (this.question.correct >= index) {
      this.question.correct = Math.max(0, this.question.correct - 1);
    }
  }

  save() {
    this.dialogRef.close(this.question);
  }

  cancel() {
    this.dialogRef.close();
  }

}
