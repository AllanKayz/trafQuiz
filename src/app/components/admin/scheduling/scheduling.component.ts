import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LessonService } from '../../../services/lesson.service';
import { VehicleService } from '../../../services/vehicle.service';
import { TraffiquizService } from '../../../traffiquiz.service';
import { Lesson } from '../../../models/lesson';
import { Vehicle } from '../../../models/vehicle';

@Component({
    selector: 'app-scheduling',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatTableModule, MatSelectModule, MatSnackBarModule],
    templateUrl: './scheduling.component.html',
    styleUrls: ['./scheduling.component.css']
})
export class SchedulingComponent {
    private lessonService = inject(LessonService);
    private vehicleService = inject(VehicleService);
    private trafService = inject(TraffiquizService);
    private snackBar = inject(MatSnackBar);

    lessons = signal<Lesson[]>([]);
    vehicles = signal<Vehicle[]>([]);
    instructors = this.trafService.instructorsSignal;

    displayedColumns: string[] = ['title', 'startTime', 'instructor', 'vehicle', 'actions'];

    loading = false;

    constructor() {
        this.loadData();
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
            this.snackBar.open(res.message, 'Close', { duration: 3000 });
            this.loadData();
        });
    }

    assignVehicle(lessonId: number, vehicleId: any) {
        if (!vehicleId) return;
        this.lessonService.patchLesson(lessonId, { assignedVehicleId: vehicleId }).subscribe(() => {
            this.snackBar.open('Vehicle assigned', 'Close', { duration: 2000 });
        });
    }
}
