import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { LessonService } from '../../services/lesson.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-tools.component.html',
  styleUrls: ['./admin-tools.component.css']
})
export class AdminToolsComponent {
  token = 'dev';
  count = 2;
  result: any = null;
  loading = false;
  error = '';

  // Confirmation modal state
  showConfirm = false;

  // Create modal & instructors
  showCreate = false;
  instructors: any[] = [];
  newLesson: any = {
    title: '',
    subject: '',
    startTimeLocal: '',
    durationMinutes: 60,
    instructorId: null,
    location: '',
    onlineLink: '',
    capacity: 10,
    notes: ''
  };

  // Toast / redirect state
  successMessage = '';
  private redirectTimeout: any = null;

  constructor(private admin: AdminService, private lessonService: LessonService, private router: Router) {
    this.fetchInstructors();
  }

  // Entry point for seeding; if count > 1, show confirmation modal
  openSeedConfirm() {
    if ((this.count ?? 0) > 1) {
      this.showConfirm = true;
      return;
    }
    this.doSeed();
  }

  cancelConfirm() {
    this.showConfirm = false;
  }

  confirmSeed() {
    this.showConfirm = false;
    this.doSeed();
  }

  private doSeed() {
    this.loading = true;
    this.error = '';
    this.result = null;
    this.admin.seedLessons(this.count, this.token).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
        // Refresh lessons in the UI after seeding
        this.lessonService.fetchLessons().subscribe({ next: () => { /* silently refresh */ }, error: () => { /* ignore */ } });

        // Show success toast and redirect to Lessons view shortly
        this.successMessage = `Seeded ${res?.seeded ?? 0} lesson(s)`;
        // clear any existing timeout
        if (this.redirectTimeout) { clearTimeout(this.redirectTimeout); this.redirectTimeout = null; }
        this.redirectTimeout = setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/dashboard','lessons']);
        }, 900);
      },
      error: (err) => {
        this.error = 'Seed failed: ' + (err?.message || 'server error');
        this.loading = false;
      }
    });
  }

  check() {
    this.loading = true;
    this.error = '';
    this.result = null;
    this.admin.checkLessons(this.token).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Check failed: ' + (err?.message || 'server error');
        this.loading = false;
      }
    });
  }

  fetchInstructors() {
    this.admin.getInstructors().subscribe({ next: (r) => this.instructors = r || [], error: () => {/* ignore */} });
  }

  createLesson() {
    // Basic validation
    this.error = '';
    if (!this.newLesson.title || !this.newLesson.startTimeLocal) {
      this.error = 'Title and Start Time are required';
      return;
    }

    const startIso = new Date(this.newLesson.startTimeLocal).toISOString();
    const payload: any = {
      title: this.newLesson.title,
      subject: this.newLesson.subject,
      startTime: startIso,
      durationMinutes: this.newLesson.durationMinutes,
      location: this.newLesson.location,
      onlineLink: this.newLesson.onlineLink,
      capacity: this.newLesson.capacity,
      notes: this.newLesson.notes
    };

    // If an instructor id was selected, map it to the expected "instructor" object
    if (this.newLesson.instructorId) {
      const inst = this.instructors.find(i => i.id == this.newLesson.instructorId);
      if (inst) payload.instructor = { id: inst.id, name: (inst.firstName || '') + ' ' + (inst.lastName || '') };
    }

    this.loading = true;
    this.lessonService.addLesson(payload, this.token).subscribe({
      next: (res) => {
        this.loading = false;
        this.result = res;
        this.showCreate = false;
        this.lessonService.fetchLessons().subscribe({ next: () => {}, error: () => {} });
        this.successMessage = 'Lesson created';
        if (this.redirectTimeout) { clearTimeout(this.redirectTimeout); this.redirectTimeout = null; }
        this.redirectTimeout = setTimeout(() => {
          this.successMessage = '';
          this.router.navigate(['/dashboard','lessons']);
        }, 900);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Create failed: ' + (err?.message || 'server error');
      }
    });
  }

  closeToast() {
    this.successMessage = '';
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
      this.redirectTimeout = null;
    }
  }
}
