import { Component, computed, inject, input, signal } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TraffiquizService } from '../../traffiquiz.service';
import { Router } from '@angular/router';
import { ButtonConfigService } from '../../widgets/button-config.service';
import { FormConfigService } from '../../widgets/form-config.service';
import { TableColumn, TableComponent } from '../../widgets/table/table.component';
import { STUDENT_FORM_FIELDS } from '../../widgets/dynamic-form/student-form.config';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { SectionheaderComponent } from '../../widgets/sectionheader/sectionheader.component';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
	selector: 'app-students',
	standalone: true,
	imports: [MatDialogModule, StatCardComponent, SectionheaderComponent, TableComponent, MatNativeDateModule],
	templateUrl: './students.component.html',
	styleUrls: ['./students.component.css']
})
export class StudentsComponent {
	header = 'Student Management';
	content = 'Manage student registrations and track their progress.';

	private trafQuizService = inject(TraffiquizService);
	private buttonService = inject(ButtonConfigService);
	private router = inject(Router);
	private dialog = inject(MatDialog);
	private formConfig = inject(FormConfigService);

	user = this.trafQuizService.currentUser;
	menuName = 'students'; // Current menu identifier

	// Table Configurations
	tableColumns = signal<TableColumn[]>([
		{ key: 'id', header: 'ID', type: 'number', width: '40px' },
		{ key: 'name', header: 'Name', type: 'text' },
		{ key: 'email', header: 'Email', type: 'text' },
		{ key: 'phone', header: 'Phone', type: 'text' },
		{ key: 'address', header: 'Address', type: 'text' },
		{ key: 'status', header: 'Status', type: 'text', width: '40px' }
	]);

	// Computed Actions based on Role
	tableActions = computed(() => {
		const role = this.user()?.role;
		if (role === 'admin') {
			return ['edit', 'delete', 'activate'];
		}
		return []; // Instructors: Read-only
	});

	// Get data from service
	tableData: any = this.trafQuizService.tableStudents;

	//Get buttons based on user role and current menu
	buttons = computed(() => {
		const user = this.user();
		if (!user) return [];
		return this.buttonService.getButtons(this.menuName, user.role);
	});

	widgetsSignal = this.trafQuizService.userStudentWidgets;
	widgets = input<any[]>(this.widgetsSignal());

	constructor() {
		//this.trafQuizService.fetchStudents(); // Fetch questions on component initialization
	}

	handleButtonAction(action: string) {
		switch (action) {
			case 'addStudent':
				this.openStudentForm();
				break;
			case 'addCategory':
				this.openStudentForm();
				break;
		}
	}

	handleTableAction(event: { action: string, item: any }) {
		const studentId = event.item.id;
		const student = this.trafQuizService.studentsSignal().find(s => s.id === studentId);

		if (!student) return;

		switch (event.action) {
			case 'edit':
				this.openStudentForm(student);
				break;
			case 'activate':
				this.deleteStudent(studentId);
				break;
			case 'delete':
				this.deleteStudent(studentId);
				break;
		}
	}

	openStudentForm(student?: any) {
		let fields = this.formConfig.getFormConfig('student').map(f => ({ ...f }));

		// If editing, make password optional
		if (student) {
			fields = fields.map((f: any) => {
				if (f.key === 'password' || f.key === 'confirmpassword') {
					return { ...f, validators: [Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)] };
				}
				return f;
			});
		}

		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: student ? 'Edit Student' : 'Add New Student',
				fields: fields,
				initialData: student || {},
				submitText: student ? 'Update' : 'Add'
			}
		});

		dialogRef.componentInstance.submitted.subscribe(formData => {
			this.saveStudent(formData, student?.id);
			dialogRef.close();
		});
	}

	// Function to decide which form view to show
	private checkTitle(title: any) {
		let fields = [];
		if (title == 'Edit Student') {
			fields = STUDENT_FORM_FIELDS;
		} else {
			fields = STUDENT_FORM_FIELDS;
		}

		return fields;
	}

	private saveStudent(data: any, id?: number) {
		const studentData = {
			...data,
			id: id || 0,
			name: data.firstName + ' ' + data.lastName
		};

		// If password is empty in edit mode, don't send it
		if (id && !data.password) {
			delete (studentData as any).password;
			delete (studentData as any).confirmpassword;
		}

		const action = id ? this.trafQuizService.updateStudent(studentData) : this.trafQuizService.addStudent(studentData);

		action.subscribe({
			next: (res) => {
				this.trafQuizService.showNotification(`Student ${id ? 'updated' : 'added'} successfully`, 'success');
				this.trafQuizService.fetchStudents();
			},
			error: (err) => {
				this.trafQuizService.showNotification('Error saving student', 'error');
			}
		});
	}

	deleteStudent(studentID: number) { }
}

