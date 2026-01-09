import { Component, computed, inject, input, signal } from '@angular/core';

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
	selector: 'app-instructors',
	standalone: true,
	imports: [MatDialogModule, MatSnackBarModule, StatCardComponent, SectionheaderComponent, TableComponent, MatNativeDateModule],
	templateUrl: './instructors.component.html',
	styleUrls: ['./instructors.component.css']
})
export class InstructorsComponent {
	header = 'Instructor Management';
	content = 'Manage driving instructors and their schedules.';

	private trafQuizService = inject(TraffiquizService);
	private buttonService = inject(ButtonConfigService);
	private router = inject(Router);
	private snackBar = inject(MatSnackBar);
	private dialog = inject(MatDialog);
	private formConfig = inject(FormConfigService);

	user = this.trafQuizService.currentUser();
	menuName = 'instructors'; // Current menu identifier

	// Table Configurations
	tableColumns = signal<TableColumn[]>([
		{ key: 'id', header: 'ID', type: 'number', width: '40px' },
		{ key: 'name', header: 'Name', type: 'text' },
		{ key: 'email', header: 'Email', type: 'text' },
		{ key: 'phone', header: 'Phone', type: 'text' },
		{ key: 'specialization', header: 'Specialization', type: 'text' },
		{ key: 'certified', header: 'Certified', type: 'text', width: '40px' },
		{ key: 'availability', header: 'Avaibility', type: 'text' }
	]);

	tableActions = signal<string[]>(['edit', 'delete', 'activate']);

	// Get data from service
	tableData: any = this.trafQuizService.tableInstructors;

	//Get buttons based on user role and current menu
	buttons = computed(() => {
		if (!this.user) return [];
		return this.buttonService.getButtons(this.menuName, this.user.role);
	});

	widgetsSignal = this.trafQuizService.userInstructorWidgets;
	widgets = input<any[]>(this.widgetsSignal());

	constructor() {
		this.trafQuizService.fetchInstructors(); // Fetch questions on component initialization
	}

	handleButtonAction(action: string) {
		switch (action) {
			case 'addInstructor':
				this.openInstructorForm();
				break;
			case 'addSpecialization':
				this.openSpecializationForm();
				break;
			case 'addCertification':
				this.openCertificationForm();
				break;
		}
	}

	handleTableAction(event: { action: string, item: any }) {
		const instructorId = event.item.id;
		const instructor = this.trafQuizService.instructorsSignal().find(i => i.id === instructorId);

		if (!instructor) return;

		switch (event.action) {
			case 'edit':
				this.openInstructorForm(instructor);
				break;
			case 'activate':
				this.deleteStudent(instructorId);
				break;
			case 'delete':
				this.deleteStudent(instructorId);
				break;
		}
	}

	openInstructorForm(instructor?: any) {
		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: instructor ? 'Edit Instructor' : 'Add New Instructor',
				fields: this.formConfig.getFormConfig('instructor'),
				initialData: instructor || {},
				submitText: instructor ? 'Update' : 'Add'
			}
		});

		dialogRef.componentInstance.submitted.subscribe(formData => {
			this.saveInstructor(formData, instructor?.id);
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

	private saveInstructor(data: any, id?: number) {
		console.log('clicked');
		
		const newInstructorData = {
			name: data.firstName + ' ' + data.lastName,
			username: data.username,
			email: data.email,
			phone: data.phone,
			license_number: data.license,
			password: data.password,
			experience: data.experience,
			specialization: data.specialization,
			certification: data.certification,
			availability: data.available
		};

		const instructorData = {
			id: id || 0,
			name: data.firstName + ' ' + data.lastName,
			username: data.username,
			email: data.email,
			phone: data.phone,
			license_number: data.license,
			password: data.password,
			experience: data.experience,
			specialization: data.specialization,
			certification: data.certification,
			availability: data.available
		};

		const action = id ? this.trafQuizService.updateInstructor(instructorData) : this.trafQuizService.addInstructor(newInstructorData);

		action.subscribe({
			next: (res) => {
				console.log(res);
				if (res.success) {
					this.snackBar.open(`Instructor ${id ? 'updated' : 'added'} successfully`, 'Close', { verticalPosition: 'top', duration: 4000 });
					this.trafQuizService.fetchInstructors();
				} else {
					this.snackBar.open(res.message, 'Close', { verticalPosition: 'top', duration: 4000 });
				}

			},
			error: (err) => {
				console.log(err);
				this.snackBar.open('Error saving instructor', 'Close', { verticalPosition: 'top', duration: 4000 });
			}
		});
	}

	deleteStudent(studentID: number) { }

	openCertificationForm(certification?: any) {
		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: certification ? 'Edit Certification' : 'Add New Certification',
				fields: this.formConfig.getFormConfig('certification'),
				initialData: certification || {},
				submitText: certification ? 'Update' : 'Add'
			}
		});

		dialogRef.componentInstance.submitted.subscribe(formData => {
			this.saveCertification(formData, certification?.id);
			dialogRef.close();
		});
	}

	private saveCertification(data: any, id: any) {
		const certification = {
			id: data.id || 0,
			certification: data.certification,
			description: data.description
		}

		const action = id ? this.trafQuizService.updateCertification(certification) : this.trafQuizService.addCertification(certification);

		action.subscribe({
			next: (res) => {
				this.snackBar.open(`Certification ${id ? 'updated' : 'added'} successfully`, 'Close', { duration: 3000 });
				this.trafQuizService.getSpecializations();
			},
			error: (err) => {
				console.log(err);
				this.snackBar.open('Error saving certification', 'Close', { duration: 3000 });
			}
		});
	}

	openSpecializationForm(specialization?: any) {
		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: specialization ? 'Edit Specialization' : 'Add New Specialization',
				fields: this.formConfig.getFormConfig('specialization'),
				initialData: specialization || {},
				submitText: specialization ? 'Update' : 'Add'
			}
		});

		dialogRef.componentInstance.submitted.subscribe(formData => {
			this.saveSpecialization(formData, specialization?.id);
			dialogRef.close();
		});
	}

	private saveSpecialization(data: any, id: any) {

		const specialization = {
			id: data.id || 0,
			specialization: data.specialization,
			description: data.description
		}

		const action = id ? this.trafQuizService.updateSpecialization(specialization) : this.trafQuizService.addSpecialization(specialization);

		action.subscribe({
			next: (res) => {
				this.snackBar.open(`Specialization ${id ? 'updated' : 'added'} successfully`, 'Close', { duration: 3000 });
				this.trafQuizService.getSpecializations();
			},
			error: (err) => {
				console.log(err);
				this.snackBar.open('Error saving specialization', 'Close', { duration: 3000 });
			}
		});
	}
}
