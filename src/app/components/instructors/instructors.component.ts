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
	selector: 'app-instructors',
	standalone: true,
	imports: [MatDialogModule, StatCardComponent, SectionheaderComponent, TableComponent, MatNativeDateModule],
	templateUrl: './instructors.component.html',
	styleUrls: ['./instructors.component.css']
})
export class InstructorsComponent {
	header = 'Instructor Management';
	content = 'Manage driving instructors and their schedules.';

	private trafQuizService = inject(TraffiquizService);
	private buttonService = inject(ButtonConfigService);
	private router = inject(Router);
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
		{ key: 'availability', header: 'Availability', type: 'text' },
		{ key: 'status', header: 'Status', type: 'text' }
	]);

	tableActions = computed(() => {
		if (this.user?.role === 'admin') {
			return ['edit', 'delete'];
		}
		return [];
	});

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
			case 'deactivate':
				this.toggleStatus(instructor);
				break;
			case 'available':
			case 'unavailable':
				this.toggleAvailability(instructor);
				break;
			case 'delete':
				this.confirmDelete(instructor);
				break;
		}
	}

	openInstructorForm(instructor?: any) {
		let fields = this.formConfig.getFormConfig('instructor').map(f => ({ ...f }));

		// If editing, make password optional
		if (instructor) {
			fields = fields.map((f: any) => {
				if (f.key === 'password') {
					return { ...f, validators: [Validators.min(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!*#?&])[A-Za-z\d@!%#?&]{8,}$/)] };
				}
				return f;
			});
		}

		const dialogRef = this.dialog.open(DynamicFormComponent, {
			width: '800px',
			data: {
				title: instructor ? 'Edit Instructor' : 'Add New Instructor',
				fields: fields,
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
		const instructorData = {
			...data,
			id: id || 0,
			license_number: data.license,
			availability: data.available
		};

		// If password is empty in edit mode, don't send it
		if (id && !data.password) {
			delete (instructorData as any).password;
		}

		console.log('Saving Instructor:', instructorData);

		const action = id ? this.trafQuizService.updateInstructor(instructorData) : this.trafQuizService.addInstructor(instructorData);

		action.subscribe({
			next: (res) => {
				if (res.success) {
					this.trafQuizService.showNotification(`Instructor ${id ? 'updated' : 'added'} successfully`, 'success');
					this.trafQuizService.fetchInstructors();
				} else {
					this.trafQuizService.showNotification(res.message, 'error');
				}

			},
			error: (err) => {
				this.trafQuizService.showNotification('Error saving instructor', 'error');
			}
		});
	}

	private toggleStatus(instructor: any) {
		const action = (instructor.status || 'active') === 'active' ? 'deactivate' : 'activate';
		this.trafQuizService.showConfirm(`Are you sure you want to ${action} ${instructor.firstName}?`, action.toUpperCase())
			.subscribe(() => {
				this.trafQuizService.toggleInstructorStatus(instructor).subscribe({
					next: () => {
						this.trafQuizService.showNotification(`Instructor ${action}d successfully`, 'success');
						this.trafQuizService.fetchInstructors();
					},
					error: (err) => {
						this.trafQuizService.showNotification(`Error ${action}ing instructor`, 'error');
					}
				});
			});
	}

	private toggleAvailability(instructor: any) {
		const isAvailable = Number(instructor.availability) === 1;
		const action = isAvailable ? 'set as unavailable' : 'set as available';
		const confirmLabel = isAvailable ? 'UNAVAILABLE' : 'AVAILABLE';

		this.trafQuizService.showConfirm(`Are you sure you want to ${action} for ${instructor.firstName}?`, confirmLabel)
			.subscribe(() => {
				this.trafQuizService.toggleInstructorAvailability(instructor).subscribe({
					next: () => {
						this.trafQuizService.showNotification(`Instructor availability updated successfully`, 'success');
						this.trafQuizService.fetchInstructors();
					},
					error: (err) => {
						this.trafQuizService.showNotification(`Error updating instructor availability`, 'error');
					}
				});
			});
	}

	private confirmDelete(instructor: any) {
		this.trafQuizService.showConfirm(`Are you sure you want to delete ${instructor.firstName}? This action cannot be undone.`, 'DELETE', 'Delete Instructor')
			.subscribe(() => {
				this.trafQuizService.deleteInstructor(instructor.id).subscribe({
					next: () => {
						this.trafQuizService.showNotification('Instructor deleted successfully', 'success');
						this.trafQuizService.fetchInstructors();
					},
					error: (err) => {
						this.trafQuizService.showNotification('Error deleting instructor', 'error');
					}
				});
			});
	}

	deleteStudent(studentID: number) {
		// Legacy method
	}

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
				this.trafQuizService.showNotification(`Certification ${id ? 'updated' : 'added'} successfully`, 'success');
				this.trafQuizService.getSpecializations();
			},
			error: (err) => {
				console.log(err);
				this.trafQuizService.showNotification('Error saving certification', 'error');
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
				this.trafQuizService.showNotification(`Specialization ${id ? 'updated' : 'added'} successfully`, 'success');
				this.trafQuizService.getSpecializations();
			},
			error: (err) => {
				console.log(err);
				this.trafQuizService.showNotification('Error saving specialization', 'error');
			}
		});
	}
}
