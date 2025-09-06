import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
	imports: [CommonModule, MatDialogModule, MatSnackBarModule, StatCardComponent, SectionheaderComponent, TableComponent, MatNativeDateModule],
	templateUrl: './students.component.html',
	styleUrls: ['./students.component.css']
})
export class StudentsComponent {
	header = 'Student Management';
	content = 'Manage student registrations and track their progress.';

	private trafQuizService = inject(TraffiquizService);
	private buttonService = inject(ButtonConfigService);
	private router = inject(Router);
	private snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);
	private formConfig = inject(FormConfigService);

	user = this.trafQuizService.currentUser();
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

	tableActions = signal<string[]>(['edit', 'delete', 'activate']);

	// Get data from service
	tableData: any = this.trafQuizService.tableStudents;

	//Get buttons based on user role and current menu
	buttons = computed(() => {
		if (!this.user) return [];
		return this.buttonService.getButtons(this.menuName, this.user.role);
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
		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: student ? 'Edit Student' : 'Add New Student',
				fields: this.formConfig.getFormConfig('student'),
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
		let status = 'inactive';
		if (data.active) status = 'active';

		const newStudentData = {
			name: data.firstName + ' ' + data.lastName,
			username: data.username,
			email: data.email,
			phone: data.phone,
			password: data.password,
			address: data.address,
			package: data.package,
			status: status
		};

		const studentData = {
			id: id || 0,
			password: data.password,
			firstName: data.firstName,
			lastName: data.lastName,
			email: data.email,
			phone: data.phone,
			address: data.address,
			enrollmentDate: data.enrollmentDate,
			active: data.active
		};

		const action = id ? this.trafQuizService.updateStudent(studentData) : this.trafQuizService.addStudent(newStudentData);

		action.subscribe({
			next: (res) => {
				this.snackBar.open(`Student ${id ? 'updated' : 'added'} successfully`, 'Close', { duration: 3000 });
				this.trafQuizService.fetchStudents();
			},
			error: (err) => {
				console.log(err);
				this.snackBar.open('Error saving student', 'Close', { duration: 3000 });
			}
		});
	}

	deleteStudent(studentID: number) { }
}

