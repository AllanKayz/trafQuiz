import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraffiquizService, StudentProgress } from '../../traffiquiz.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatTableModule
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  service = inject(TraffiquizService);

  user = this.service.currentUser;

  // State
  isLoading = signal<boolean>(false);
  progressData = signal<StudentProgress | null>(null);

  // Admin/Instructor specific state
  students = this.service.tableStudents; // Reusing existing table format or fetch raw students
  selectedStudentId = signal<string | null>(null);

  isStudent = computed(() => this.user()?.role === 'student');
  isAdminOrInstructor = computed(() => ['admin', 'instructor'].includes(this.user()?.role || ''));

  constructor() {
    effect(() => {
      // Auto-load student data if role is student
      if (this.isStudent()) {
        this.loadProgress();
      }

      // If admin, mock loading list - handled by service usually, but ensure we have them
      if (this.isAdminOrInstructor() && this.service.studentsSignal().length === 0) {
        this.service.fetchStudents();
      }
    });
  }

  loadProgress(studentId?: string) {
    this.isLoading.set(true);
    this.service.fetchStudentProgress(studentId).subscribe({
      next: (data) => {
        this.progressData.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching progress', err);
        this.isLoading.set(false);
      }
    });
  }

  onStudentSelect(studentId: string) {
    this.selectedStudentId.set(studentId);
    this.loadProgress(studentId);
  }

  // Helper for status color
  getStatusColor(status: string): string {
    return status === 'pass' ? 'primary' : 'warn';
  }
}
