import { Component, computed, inject, input, signal, effect } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TraffiquizService } from '../../traffiquiz.service';
import { Router, ActivatedRoute } from '@angular/router';
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
	private route = inject(ActivatedRoute);
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
			return ['edit', 'delete'];
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
		effect(() => {
			const editId = this.route.snapshot.queryParamMap.get('edit');
			if (editId) {
				const id = parseInt(editId);
				const student = this.trafQuizService.studentsSignal().find(s => s.id === id);
				if (student) {
					// Need a slight delay to ensure dialog can open if component just loaded
					setTimeout(() => this.openStudentForm(student), 100);
					// Clear query param to avoid re-opening
					this.router.navigate([], { relativeTo: this.route, queryParams: { edit: null }, queryParamsHandling: 'merge' });
				}
			}
		});
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
			case 'deactivate':
				this.toggleStatus(student);
				break;
			case 'delete':
				this.confirmDelete(student);
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
				initialData: student ? {
					...student,
					enrollmentDate: student.created_at || new Date().toISOString().split('T')[0]
				} : {},
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

	private toggleStatus(student: any) {
		const action = student.status === 'active' ? 'deactivate' : 'activate';
		this.trafQuizService.showConfirm(`Are you sure you want to ${action} ${student.firstName}?`, action.toUpperCase())
			.subscribe(() => {
				this.trafQuizService.toggleStudentStatus(student).subscribe({
					next: () => {
						this.trafQuizService.showNotification(`Student ${action}d successfully`, 'success');
						this.trafQuizService.fetchStudents();
					},
					error: (err) => {
						this.trafQuizService.showNotification(`Error ${action}ing student`, 'error');
					}
				});
			});
	}

	private confirmDelete(student: any) {
		this.trafQuizService.showConfirm(`Are you sure you want to delete ${student.firstName}? This action cannot be undone.`, 'DELETE', 'Delete Student')
			.subscribe(() => {
				this.trafQuizService.deleteStudent(student.id).subscribe({
					next: () => {
						this.trafQuizService.showNotification('Student deleted successfully', 'success');
						this.trafQuizService.fetchStudents();
					},
					error: (err) => {
						this.trafQuizService.showNotification('Error deleting student', 'error');
					}
				});
			});
	}

	deleteStudent(studentID: number) {
		// Legacy method or internal use if needed
	}
}

