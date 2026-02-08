import { Component, OnInit, OnDestroy, signal, effect, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Lesson } from '../../models/lesson';
import { LessonService } from '../../services/lesson.service';
import { LessonCardComponent } from './lesson-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { TraffiquizService } from '../../traffiquiz.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../widgets/form-config.service';
import { MessagesService } from '../messages/messages.service';

@Component({
  selector: 'app-upcoming-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonCardComponent, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatListModule, MatCardModule],
  templateUrl: './upcoming-lessons.component.html',
  styleUrls: ['./upcoming-lessons.component.css']
})
export class UpcomingLessonsComponent implements OnInit, OnDestroy {
  private service = inject(TraffiquizService);
  private lessonService = inject(LessonService);
  private messagesService = inject(MessagesService);
  private dialog = inject(MatDialog);
  private formConfig = inject(FormConfigService);

  user = this.service.currentUser;
  isAdmin = computed(() => this.user()?.role === 'admin');
  isInstructor = computed(() => this.user()?.role === 'instructor');
  isStudent = computed(() => this.user()?.role === 'student');

  lessons: Lesson[] = [];
  selectedLesson: Lesson | null = null;
  range: 'today' | '7days' | 'week' | 'month' = '7days';
  q = '';
  private subscriptions: Subscription[] = [];

  constructor() { }

  ngOnInit(): void {
    this.loadLessons();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadLessons() {
    this.lessonService.fetchLessons(this.range).subscribe((ls) => {
      this.lessons = ls;

      // Auto-select first lesson if none selected
      if (this.lessons.length > 0) {
        const stillExists = this.lessons.find(l => l.id === this.selectedLesson?.id);
        if (!stillExists) {
          this.selectedLesson = this.lessons.find((l) => l.status === 'upcoming') || this.lessons[0];
        }
      } else {
        this.selectedLesson = null;
      }
    });
  }

  // Called when range select changes
  onRangeChange() {
    this.loadLessons();
  }

  filteredLessons(): Lesson[] {
    const q = this.q.trim().toLowerCase();
    return this.lessons.filter((l) => {
      const matchSearch = !q || (
        l.title + ' ' +
        (l.instructor?.name || '') + ' ' +
        (l.subject || '') + ' ' +
        (l.studentName || '')
      ).toLowerCase().includes(q);

      return matchSearch;
    });
  }

  selectLesson(l: Lesson) {
    this.selectedLesson = l;
  }

  bookLesson() {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Book a Lesson',
        submitText: 'Request Booking',
        fields: this.formConfig.getFormConfig('book-lesson'),
        initialData: {}
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      const instructor = this.service.instructorsSignal().find(i => i.id === data.instructorId);

      // Combine date and time
      const date = new Date(data.startDate);
      const [hours, minutes] = data.startTime.split(':');
      date.setHours(parseInt(hours), parseInt(minutes));

      const payload: Partial<Lesson> = {
        ...data,
        startTime: date.toISOString(),
        type: 'private',
        studentId: this.user()?.id,
        studentName: this.user()?.username, // or use full name if available
        instructor: { id: data.instructorId, name: instructor ? `${instructor.firstName} ${instructor.lastName}` : 'Unknown' },
        status: 'pending',
        studentCount: 1
      };

      this.lessonService.addLesson(payload).subscribe(() => {
        dialogRef.close();
        this.loadLessons();
        this.service.showNotification('Your lesson booking has been sent to the instructor for approval.', 'success');
      });
    });
  }

  allocate(lesson: Lesson) {
    if (!this.isAdmin()) return;

    // Fetch dependencies if not already loaded
    if (this.service.instructorsSignal().length === 0) this.service.fetchInstructors();
    if (this.service.vehiclesSignal().length === 0) this.service.fetchVehicles();
    if (this.service.studentsSignal().length === 0) this.service.fetchStudents();

    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Manual Allocation',
        submitText: 'Update Allocation',
        fields: [
          {
            name: 'instructorId',
            label: 'Instructor',
            type: 'select',
            required: true,
            options: this.service.instructorsSignal().map(i => ({ value: i.id, label: `${i.firstName} ${i.lastName}` }))
          },
          {
            name: 'assignedVehicleId',
            label: 'Vehicle',
            type: 'select',
            required: false,
            options: this.service.vehiclesSignal().map(v => ({ value: v.id, label: `${v.make} ${v.model} (${v.license_plate})` }))
          },
          {
            name: 'studentId',
            label: 'Student',
            type: 'select',
            required: false,
            options: this.service.studentsSignal().map(s => ({ value: s.id, label: `${s.firstName} ${s.lastName}` }))
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'pending', label: 'Pending' },
              { value: 'cancelled', label: 'Cancelled' }
            ]
          }
        ],
        initialData: {
          instructorId: lesson.instructor?.id,
          assignedVehicleId: lesson.assignedVehicleId,
          studentId: lesson.studentId,
          status: lesson.status
        }
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      this.lessonService.patchLesson(lesson.id, data).subscribe(() => {
        dialogRef.close();
        this.loadLessons();
        this.service.showNotification('Lesson allocation updated successfully.', 'success');
      });
    });
  }

  approve(lesson: Lesson | null) {
    if (!lesson) return;
    this.lessonService.approveLesson(lesson.id).subscribe(() => {
      this.loadLessons();
      this.service.showNotification('The lesson has been successfully confirmed and added to your schedule.', 'success');
    });
  }

  decline(lesson: Lesson | null) {
    if (!lesson) return;

    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '400px',
      data: {
        title: 'Decline Lesson Request',
        submitText: 'Submit',
        fields: [
          { name: 'reason', label: 'Reason for declining', type: 'textarea', required: true }
        ]
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      this.lessonService.declineLesson(lesson.id, data.reason).subscribe(() => {
        this.loadLessons();
        dialogRef.close();
        this.service.showNotification('Lesson request declined', 'info');
      });
    });
  }

  join(lesson: Lesson | null) {
    if (!lesson) return;
    this.lessonService.joinLesson(lesson.id).subscribe((res) => {
      this.service.showNotification(`Joined: ${res.meetingLink || 'success'}`, 'success');
    });
  }

  cancel(lesson: Lesson | null) {
    if (!lesson) return;
    this.service.showConfirm('Cancel this lesson?', 'CANCEL').subscribe(() => {
      this.lessonService.cancelLesson(lesson.id).subscribe(() => {
        this.service.showNotification('Lesson canceled', 'info');
        this.loadLessons();
      });
    });
  }

  message(lesson: Lesson | null) {
    if (!lesson) return;

    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: `Message ${lesson.instructor?.name || 'Instructor'}`,
        submitText: 'Send',
        fields: [
          { name: 'message', label: 'Your message', type: 'textarea', required: true }
        ]
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      // Send message via MessagesService
      // MessagesService.sendMessage(conversationId, text, type, attachment, recipientId)
      this.messagesService.sendMessage(
        null,
        data.message,
        'text',
        null,
        lesson.instructor?.id
      ).subscribe({
        next: () => {
          dialogRef.close();
          this.service.showNotification('Message sent successfully', 'success');
        },
        error: () => {
          this.service.showNotification('Failed to send message', 'error');
        }
      });
    });
  }
}
