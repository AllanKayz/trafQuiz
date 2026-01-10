import { Component, OnInit, signal, effect, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lesson } from '../../models/lesson';
import { LessonService } from '../../services/lesson.service';
import { LessonCardComponent } from './lesson-card.component';
import { MatIconModule } from '@angular/material/icon';
import { TraffiquizService } from '../../traffiquiz.service';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormComponent } from '../../widgets/dynamic-form/dynamic-form.component';
import { FormConfigService } from '../../widgets/form-config.service';

@Component({
  selector: 'app-upcoming-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonCardComponent, MatIconModule],
  templateUrl: './upcoming-lessons.component.html',
  styleUrls: ['./upcoming-lessons.component.css']
})
export class UpcomingLessonsComponent implements OnInit {
  private service = inject(TraffiquizService);
  private lessonService = inject(LessonService);
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

  constructor() { }

  ngOnInit(): void {
    this.loadLessons();
  }

  loadLessons() {
    this.lessonService.getLessons(this.range).subscribe((ls) => {
      const user = this.user();
      let filtered = ls.slice();

      if (user) {
        if (user.role === 'student') {
          // Students see group lessons OR lessons they booked
          filtered = ls.filter(l => l.type === 'group' || l.studentId === user.id);
        } else if (user.role === 'instructor') {
          // Instructors see lessons assigned to them
          filtered = ls.filter(l => l.instructor.id === user.id);
        }
        // Admins see everything
      }

      // sort ascending by startTime
      this.lessons = filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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
        l.instructor.name + ' ' +
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
      const payload: Partial<Lesson> = {
        ...data,
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

  approve(lesson: Lesson | null) {
    if (!lesson) return;
    this.lessonService.approveLesson(lesson.id).subscribe(() => {
      this.loadLessons();
      this.service.showNotification('The lesson has been successfully confirmed and added to your schedule.', 'success');
    });
  }

  decline(lesson: Lesson | null) {
    if (!lesson) return;
    const reason = prompt('Reason for declining?');
    if (reason === null) return;
    this.lessonService.declineLesson(lesson.id, reason).subscribe(() => {
      this.loadLessons();
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
    // In future open messages modal; for now open prompt
    const msg = prompt(`Message to ${lesson.instructor.name}`);
    if (!msg) return;
    // TODO: wire to MessagesService
    this.service.showNotification(`Message sent (mock): ${msg}`, 'success');
  }
}
