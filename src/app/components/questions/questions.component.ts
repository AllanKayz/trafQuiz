import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectionheaderComponent } from '../../widgets/sectionheader/sectionheader.component';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { TraffiquizService } from '../../traffiquiz.service';
import { ApiResponse, Question } from '../../trafquiz';
import { ButtonConfigService } from '../../widgets/button-config.service';
import { Router } from '@angular/router';
import { TableColumn, TableComponent } from "../../widgets/table/table.component";
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuestionFormComponent } from '../../widgets/question-form/question-form.component';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../widgets/form-config.service';
import { QUESTION_FORM_FIELDS, QUESTION_OPTION_FIELDS } from '../../widgets/dynamic-form/question-form.config';
import { CATEGORY_FORM_FIELDS } from '../../widgets/dynamic-form/category.config';

@Component({
	selector: 'app-questions',
	standalone: true,
	imports: [CommonModule, SectionheaderComponent, StatCardComponent, TableComponent, MatSnackBarModule, MatDialogModule],
	templateUrl: './questions.component.html',
	styleUrl: './questions.component.css'
})
export class QuestionsComponent {
	header = 'Question Bank';
	content = 'Manage exam questions and categories.';

	private trafQuizService = inject(TraffiquizService);
	private buttonService = inject(ButtonConfigService);
	private router = inject(Router);
	private snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);
	private formConfig = inject(FormConfigService);

	user = this.trafQuizService.currentUser();
	menuName = 'questions'; // Current menu identifier

	// Table Configurations
	tableColumns = signal<TableColumn[]>([
		{ key: 'id', header: 'ID', type: 'number', width: '40px' },
		{ key: 'question', header: 'Question', type: 'text' },
		{ key: 'options', header: 'Options', type: 'text' },
		{ key: 'correct', header: 'Correct Answer', type: 'text' },
		{ key: 'flagged', header: 'Flagged', type: 'text', width: '40px' },
		{ key: 'hasImage', header: 'Has Image', type: 'text', width: '40px' }
	]);

	tableActions = signal<string[]>(['edit', 'delete', 'flag']);

	// Get data from service
	tableData: any = this.trafQuizService.tableQuestions;

	//Get buttons based on user role and current menu
	buttons = computed(() => {
		if (!this.user) return [];
		return this.buttonService.getButtons(this.menuName, this.user.role);
	});

	widgetsSignal = this.trafQuizService.userQuestionWidgets;
	widgets = input<any[]>(this.widgetsSignal());

	constructor() {
		// Fetch questions on component initialization
		//this.trafQuizService.fetchQuestions();
	}

	handleButtonAction(action: string) {
		switch (action) {
			case 'addQuestion':
				this.addQuestionForm();
				break;
			case 'addCategory':
				this.addCategoryForm();
				break;
		}
	}

	handleTableAction(event: { action: string, item: any }) {
		const questionId = event.item.id;
		const question = this.trafQuizService.questionsSignal().find(q => q.id === questionId);

		if (!question) return;

		switch (event.action) {
			case 'edit':
				this.openQuestionForm(question);
				break;
			case 'delete':
				this.deleteQuestion(questionId);
				break;
			case 'flag':
				this.flagQuestion(question);
				break;
		}
	}

	private openQuestionForm(question?: Question) {
		const dialogRef = this.dialog.open(QuestionFormComponent, {
			width: '600px',
			data: { question }
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this.trafQuizService.fetchQuestions(); // Refresh data
			}
		});
	}

	private deleteQuestion(id: number) {
		if (confirm('Are you sure you want to delete this question?')) {
			this.trafQuizService.deleteQuestion(id).subscribe({
				next: () => {
					this.snackBar.open('Question deleted successfully', 'Close', { duration: 3000 });
					this.trafQuizService.fetchQuestions(); // Refresh data
				},
				error: () => this.snackBar.open('Error deleting question', 'Close', { duration: 3000 })
			});
		}

	}

	private flagQuestion(question?: Question) {

	}

	getActionIcon(action: string): string {
		const icons: Record<string, string> = {
			edit: 'edit',
			delete: 'delete',
			flag: 'flag',
			view: 'visibility'
		};
		return icons[action] || 'more_vert';
	}
	
	// Helper function to transform questions data back to API structure
	private transformQuestion(item: Question): ApiResponse {
		return {
			id: item.id!,
  			answer: item.options[item.correct],
  			option_a: item.options[0],
  			option_b: item.options[1],
  			option_c: item.options[2],
  			photo: item.image!,
  			question: item.question
		}
	}

	addQuestionForm(question?: any) {
		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: question ? 'Edit Question' : 'Add New Question',
				fields: this.formConfig.getFormConfig('question'),
				initialData: question ? this.transformQuestion(question) : {},
				submitText: question ? 'Update' : 'Create'
			}
		});

		dialogRef.componentInstance.submitted.subscribe(formData => {
			this.saveQuestion(formData, question?.id);
			dialogRef.close();
		});
	}

	private saveQuestion(data: any, id?: number) {
		const questionData = {
			id: id || 0,
			question: data.question,
			category: data.category,
			difficulty: data.difficulty,
			options: [data.option1, data.option2, data.option3],
			correct: data.correctOption,
			hasImage: data.hasImage,
			image: data.image
		};

		const action = id ? this.trafQuizService.updateQuestion(questionData) : this.trafQuizService.addQuestion(questionData);

		action.subscribe({
			next: () => {
				this.snackBar.open(`Question ${id ? 'updated' : 'added'} successfully`, 'Close', { duration: 3000 });
				this.trafQuizService.fetchQuestions();
			},
			error: () => this.snackBar.open('Error saving question', 'Close', { duration: 3000 })
		});
	}

	addCategoryForm(category?: any) {
		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: category ? 'Edit Category' : 'Add New Category',
				fields: CATEGORY_FORM_FIELDS,
				initialData: category || {},
				submitText: category ? 'Update' : 'Create'
			}
		});

		dialogRef.componentInstance.submitted.subscribe(formData => {
			this.saveCategory(formData, category?.id);
			dialogRef.close();
		});
	}

	private saveCategory(data: any, id: number) {

	}
}


