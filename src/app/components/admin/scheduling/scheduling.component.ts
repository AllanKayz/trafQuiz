import { Component, inject, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { LessonService } from '../../../services/lesson.service';
import { VehicleService } from '../../../services/vehicle.service';
import { TraffiquizService } from '../../../traffiquiz.service';
import { Lesson } from '../../../models/lesson';
import { Vehicle } from '../../../models/vehicle';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DynamicFormComponent } from '../../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../../widgets/form-config.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
    selector: 'app-scheduling',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatSelectModule,
        MatDialogModule,
        MatTooltipModule,
        MatNativeDateModule
    ],
    templateUrl: './scheduling.component.html',
    styleUrls: ['./scheduling.component.css']
})
export class SchedulingComponent implements AfterViewInit {
    private lessonService = inject(LessonService);
    private vehicleService = inject(VehicleService);
    private trafService = inject(TraffiquizService);
    private dialog = inject(MatDialog);
    private formConfig = inject(FormConfigService);

    lessonDataSource = new MatTableDataSource<Lesson>([]);
    vehicles = signal<Vehicle[]>([]);
    instructors = this.trafService.instructorsSignal;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    displayedColumns: string[] = ['title', 'startTime', 'instructor', 'vehicle', 'actions'];

    loading = false;

    constructor() {
        this.loadData();
    }

    ngAfterViewInit() {
        this.lessonDataSource.paginator = this.paginator;
    }

    loadData() {
        this.loading = true;
        this.lessonService.getLessons().subscribe(ls => {
            this.lessonDataSource.data = ls;
            this.lessonDataSource.paginator = this.paginator;
            this.loading = false;
        });
        this.vehicleService.getVehicles().subscribe(vs => {
            this.vehicles.set(vs);
        });
    }

    autoAllocate() {
        this.loading = true;
        this.lessonService.autoAllocateSchedules().subscribe(res => {
            this.trafService.showNotification(res.message, 'success');
            this.loadData();
        });
    }

    assignVehicle(lessonId: number, vehicleId: any) {
        if (!vehicleId) return;
        this.lessonService.patchLesson(lessonId, { assignedVehicleId: vehicleId }).subscribe(() => {
            this.trafService.showNotification('Vehicle assigned', 'success');
        });
    }

    openCreateLessonDialog() {
        const dialogRef = this.dialog.open(DynamicFormComponent, {
            width: '600px',
            data: {
                title: 'Create New Lesson',
                submitText: 'Create Lesson',
                fields: this.formConfig.getFormConfig('admin-create-lesson'),
                initialData: {
                    type: 'group',
                    durationMinutes: 60,
                    capacity: 1
                }
            }
        });

        dialogRef.componentInstance.submitted.subscribe((data: any) => {
            this.handleLessonFormSubmit(data, dialogRef);
        });
    }

    openEditLessonDialog(lesson: Lesson) {
        const dialogRef = this.dialog.open(DynamicFormComponent, {
            width: '600px',
            data: {
                title: 'Edit Lesson',
                submitText: 'Save Changes',
                fields: this.formConfig.getFormConfig('admin-create-lesson'),
                initialData: {
                    ...lesson,
                    instructorId: lesson.instructor.id, // Map for form
                    startTime: new Date(lesson.startTime) // Ensure Date object for datepicker
                }
            }
        });

        dialogRef.componentInstance.submitted.subscribe((data: any) => {
            this.handleLessonFormSubmit(data, dialogRef, lesson.id);
        });
    }

    private handleLessonFormSubmit(data: any, dialogRef: any, lessonId?: number) {
        const instructor = this.trafService.instructorsSignal().find(i => i.id === data.instructorId);

        // Format Date to YYYY-MM-DD HH:mm:ss for SQL if changed
        let formattedStartTime = data.startTime;
        if (data.startTime instanceof Date) {
            const pad = (n: number) => n < 10 ? '0' + n : n;
            const d = data.startTime;
            formattedStartTime = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        }

        const payload: any = {
            ...data,
            startTime: formattedStartTime,
            instructor: {
                id: data.instructorId,
                name: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown'
            }
        };

        // Remove instructorId from root payload as backend expects matches for its keys or specific mapping
        delete payload.instructorId;

        const obs = lessonId ? this.lessonService.patchLesson(lessonId, payload) : this.lessonService.addLesson(payload);

        obs.subscribe({
            next: () => {
                this.trafService.showNotification(`Lesson ${lessonId ? 'updated' : 'created'} successfully`, 'success');
                dialogRef.close();
                this.loadData();
            },
            error: (err) => {
                this.trafService.showNotification(`Failed to ${lessonId ? 'update' : 'create'} lesson`, 'error');
                dialogRef.componentInstance.loading.set(false);
            }
        });
    }
}
