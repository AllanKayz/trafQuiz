import { Component, computed, inject, input, signal } from '@angular/core';
import { SectionheaderComponent } from '../../widgets/sectionheader/sectionheader.component';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { TraffiquizService } from '../../traffiquiz.service';
import { ApiResponse, Question } from '../../trafquiz';
import { ButtonConfigService } from '../../widgets/button-config.service';
import { Router } from '@angular/router';
import { TableColumn, TableComponent } from "../../widgets/table/table.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuestionFormComponent } from '../../widgets/question-form/question-form.component';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../widgets/form-config.service';
import { QUESTION_FORM_FIELDS, QUESTION_OPTION_FIELDS } from '../../widgets/dynamic-form/question-form.config';
import { CATEGORY_FORM_FIELDS } from '../../widgets/dynamic-form/category.config';
import { MetadataManagerDialogComponent } from '../../widgets/metadata-manager/metadata-manager-dialog.component';

@Component({
	selector: 'app-questions',
	standalone: true,
	imports: [SectionheaderComponent, StatCardComponent, TableComponent, MatDialogModule],
	templateUrl: './questions.component.html',
	styleUrl: './questions.component.css'
})
export class QuestionsComponent {
	header = 'Question Bank';
	content = 'Manage exam questions and categories.';

	private trafQuizService = inject(TraffiquizService);
	private buttonService = inject(ButtonConfigService);
	private router = inject(Router);
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
			case 'bulkUploadQuestions':
				this.bulkUploadQuestions();
				break;
			case 'addCategory':
				this.manageCategories();
				break;
		}
	}

	private bulkUploadQuestions() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e: any) => {
			const file = e.target.files[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = (re: any) => {
				try {
					const questions = JSON.parse(re.target.result);
					this.trafQuizService.bulkAddQuestions(questions).subscribe({
						next: (res: any) => {
							if (res.success) {
								this.trafQuizService.showNotification('Questions uploaded successfully', 'success');
								this.trafQuizService.fetchQuestions();
							} else {
								this.trafQuizService.showNotification('Error uploading questions: ' + res.message, 'error');
							}
						},
						error: (err) => this.trafQuizService.showNotification('Error uploading questions', 'error')
					});
				} catch (err) {
					this.trafQuizService.showNotification('Invalid JSON file', 'error');
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}

	handleTableAction(event: { action: string, item: any }) {
		const questionId = event.item.id;
		const question = this.trafQuizService.questionsSignal().find(q => q.id === questionId);

		if (!question) return;

		switch (event.action) {
			case 'edit':
				this.addQuestionForm(question);
				break;
			case 'delete':
				this.deleteQuestion(questionId);
				break;
			case 'flag':
				this.flagQuestion(question);
				break;
		}
	}


	private deleteQuestion(id: number) {
		this.trafQuizService.showConfirm('Are you sure you want to delete this question?', 'DELETE').subscribe(() => {
			this.trafQuizService.deleteQuestion(id).subscribe({
				next: () => {
					this.trafQuizService.showNotification('Question deleted successfully', 'success');
					this.trafQuizService.fetchQuestions(); // Refresh data
				},
				error: () => this.trafQuizService.showNotification('Error deleting question', 'error')
			});
		});
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
	private transformQuestionForForm(item: Question): any {
		return {
			question: item.question,
			option_a: item.options?.[0] || item.option_a || '',
			option_b: item.options?.[1] || item.option_b || '',
			option_c: item.options?.[2] || item.option_c || '',
			answer: item.correct !== -1 ? item.correct : 0,
			hasImage: item.hasImage,
			photo: item.image,
			exam_id: item.exam_id || 1
		};
	}

	addQuestionForm(question?: any) {
		const dialogRef = this.dialog.open(DynamicFormComponent, {
			maxWidth: '95vw',
			minWidth: '600px',
			data: {
				title: question ? 'Edit Question' : 'Add New Question',
				fields: this.formConfig.getFormConfig('question'),
				initialData: question ? this.transformQuestionForForm(question) : {},
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
			option_a: data.option_a,
			option_b: data.option_b,
			option_c: data.option_c,
			answer: data.answer === 0 ? data.option_a : (data.answer === 1 ? data.option_b : data.option_c),
			photo: data.hasImage ? data.photo : null,
			exam_id: 1 // Default exam_id if not provided
		};

		const action = id ? this.trafQuizService.updateQuestion(questionData) : this.trafQuizService.addQuestion(questionData);

		action.subscribe({
			next: (res: any) => {
				if (res.success || res.id) {
					this.trafQuizService.showNotification(`Question ${id ? 'updated' : 'added'} successfully`, 'success');
					this.trafQuizService.fetchQuestions();
				} else {
					this.trafQuizService.showNotification('Error saving question: ' + (res.message || 'Unknown error'), 'error');
				}
			},
			error: () => this.trafQuizService.showNotification('Error saving question', 'error')
		});
	}

	manageCategories() {
		this.dialog.open(MetadataManagerDialogComponent, {
			maxWidth: '95vw',
			minWidth: '500px',
			data: {
				title: 'Manage Categories',
				entityType: 'category',
				columns: [
					{ key: 'category', header: 'Category Name', type: 'text' },
					{ key: 'description', header: 'Description', type: 'text' }
				],
				dataSignal: () => this.trafQuizService.categoriesSignal(),
				addMethod: (data: any) => this.trafQuizService.addCategory(data),
				updateMethod: (data: any) => this.trafQuizService.updateCategory(data),
				deleteMethod: (id: number) => this.trafQuizService.deleteCategory(id)
			}
		});
	}
}


