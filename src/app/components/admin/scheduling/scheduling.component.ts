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
import { TableColumn, TableComponent } from '../../../widgets/table/table.component';
import { SectionheaderComponent } from '../../../widgets/sectionheader/sectionheader.component';
import { StatCardComponent } from '../../../widgets/stat-card/stat-card.component';
import { CalendarViewComponent } from '../../../widgets/calendar-view/calendar-view.component';
import { CalendarEvent } from 'angular-calendar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

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
        MatNativeDateModule,
        TableComponent,
        SectionheaderComponent,
        StatCardComponent,
        CalendarViewComponent,
        MatButtonToggleModule
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
    lessons = signal<Lesson[]>([]);
    vehicles = signal<Vehicle[]>([]);
    instructors = this.trafService.instructorsSignal;

    header = 'Lesson & Vehicle Scheduling';
    content = 'Manage lesson assignments and automatic vehicle allocation.';

    buttons = computed(() => [
        { name: 'Create Lesson', action: 'createLesson', color: 'accent', icon: 'add' },
        { name: 'Auto-Allocate', action: 'autoAllocate', color: 'primary', icon: 'auto_awesome' }
    ]);

    widgets = computed(() => {
        const ls = this.lessons();
        const vs = this.vehicles();
        const unassigned = ls.filter(l => !l.assignedVehicleId).length;
        const maintenance = vs.filter(v => v.status === 'maintenance').length;
        return [
            { title: 'Total Lessons', data: ls.length.toString(), footer: 'Scheduled sessions' },
            { title: 'Unassigned', data: unassigned.toString(), footer: 'Need vehicles' },
            { title: 'Fleet Status', data: `${vs.length - maintenance}/${vs.length}`, footer: 'Available vehicles' }
        ];
    });

    tableColumns = signal<TableColumn[]>([
        { key: 'title', header: 'Lesson', type: 'text' },
        { key: 'lessonDate', header: 'Date', type: 'date' },
        { key: 'lessonTime', header: 'Time', type: 'text' },
        { key: 'instructorName', header: 'Instructor', type: 'text' },
        { key: 'assignedVehicle', header: 'Vehicle', type: 'text' },
        { key: 'status', header: 'Status', type: 'status' }
    ]);

    tableData = computed(() => {
        return this.lessons().map(l => {
            const dateObj = new Date(l.startTime);
            return {
                ...l,
                lessonDate: l.startTime,
                lessonTime: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                instructorName: l.instructor?.name || 'Unassigned',
                assignedVehicle: l.assignedVehicleId ?
                    (() => {
                        const v = this.vehicles().find(v => v.id === l.assignedVehicleId);
                        return v ? `${v.make} ${v.model} (${v.registration})` : 'Assigned';
                    })() : 'None',
                status: l.assignedVehicleId ? 'scheduled' : 'pending'
            };
        });
    });

    calendarEvents = computed<CalendarEvent[]>(() => {
        return this.lessons().map(l => ({
            id: l.id,
            start: new Date(l.startTime),
            end: new Date(new Date(l.startTime).getTime() + (l.durationMinutes || 60) * 60000),
            title: `${l.title} (${l.instructor?.name || 'Unassigned'})`,
            meta: l,
            color: { primary: '#3b82f6', secondary: '#dbeafe' }
        }));
    });

    displayMode = signal<'table' | 'calendar'>('calendar');
    loading = false;

    constructor() {
        this.loadData();
    }

    ngAfterViewInit() {
        // TableComponent handles its own paginator
    }

    loadData() {
        this.loading = true;
        this.lessonService.getLessons().subscribe(ls => {
            this.lessons.set(ls);
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
        });
    }

    handleButtonAction(action: string) {
        if (action === 'createLesson') this.openCreateLessonDialog();
        if (action === 'autoAllocate') this.autoAllocate();
    }

    handleTableAction(event: { action: string, item: any }) {
        if (event.action === 'edit') this.openEditLessonDialog(event.item);
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
        const start = new Date(lesson.startTime);
        const startH = start.getHours().toString().padStart(2, '0');
        const startM = start.getMinutes().toString().padStart(2, '0');
        const timeStr = `${startH}:${startM}`;

        const dialogRef = this.dialog.open(DynamicFormComponent, {
            width: '600px',
            data: {
                title: 'Edit Lesson',
                submitText: 'Save Changes',
                fields: this.formConfig.getFormConfig('admin-create-lesson'),
                initialData: {
                    ...lesson,
                    instructorId: lesson.instructor?.id || '', // Map for form with null check
                    startDate: start, // Ensure Date object for datepicker
                    startTime: timeStr
                }
            }
        });

        dialogRef.componentInstance.submitted.subscribe((data: any) => {
            this.handleLessonFormSubmit(data, dialogRef, lesson.id);
        });
    }

    private handleLessonFormSubmit(data: any, dialogRef: any, lessonId?: number) {
        const instructor = this.trafService.instructorsSignal().find(i => i.id === data.instructorId);

        // Combine startDate and startTime
        const date = new Date(data.startDate);
        const [hours, minutes] = data.startTime.split(':');
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Use ISO string instead of manual formatting to avoid timezone ambiguity
        const formattedStartTime = date.toISOString();

        const payload: any = {
            ...data,
            startTime: formattedStartTime,
            instructor: {
                id: data.instructorId,
                name: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown'
            }
        };

        // Remove temp fields
        delete payload.startDate;
        delete payload.startTime; // Changed from duplicate startDate to startTime for correctness if following form field naming
        // Keep instructorId as it's used by the backend update logic

        const obs = lessonId ? this.lessonService.patchLesson(lessonId, payload) : this.lessonService.addLesson(payload);

        obs.subscribe({
            next: () => {
                this.trafService.showNotification(`Lesson ${lessonId ? 'updated' : 'created'} successfully`, 'success');
                dialogRef.close();
            },
            error: (err) => {
                this.trafService.showNotification(`Failed to ${lessonId ? 'update' : 'create'} lesson`, 'error');
                dialogRef.componentInstance.loading.set(false);
            }
        });
    }
}
