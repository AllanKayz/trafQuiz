import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { LessonService } from '../../../services/lesson.service';
import { TraffiquizService } from '../../../traffiquiz.service';
import { Lesson } from '../../../models/lesson';
import { DynamicFormComponent } from '../../../widgets/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, FormsModule, MatMenuModule, MatTooltipModule],
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent {
  private lessonService = inject(LessonService);
  private trafService = inject(TraffiquizService);
  private dialog = inject(MatDialog);

  user = this.trafService.currentUser;
  myLessons = signal<Lesson[]>([]);
  searchQuery = '';
  viewDate = signal<'today' | 'tomorrow'>('today');

  filteredLessons = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    const dateFilter = this.viewDate();
    const targetDate = new Date();
    if (dateFilter === 'tomorrow') targetDate.setDate(targetDate.getDate() + 1);

    return this.myLessons().filter(l => {
      const lessonDate = new Date(l.startTime);
      const isCorrectDate = lessonDate.toDateString() === targetDate.toDateString();

      const matchesSearch = !q ||
        l.title.toLowerCase().includes(q) ||
        (l.studentName || '').toLowerCase().includes(q);

      return isCorrectDate && matchesSearch;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  scheduledHours = computed(() => {
    const lessons = this.filteredLessons();
    const totalMinutes = lessons.reduce((acc, l) => acc + (l.durationMinutes || 60), 0);
    return (totalMinutes / 60).toFixed(1);
  });

  studentsToday = computed(() => {
    const lessons = this.filteredLessons();
    return lessons.reduce((acc, l) => acc + (l.studentCount || 1), 0);
  });

  constructor() {
    this.refreshSchedule();
  }

  refreshSchedule() {
    const user = this.user();
    if (user) {
      this.lessonService.getLessons(undefined, undefined, user.role, user.id).subscribe(ls => {
        this.myLessons.set(ls);
      });
    }
  }

  setViewDate(date: 'today' | 'tomorrow') {
    this.viewDate.set(date);
  }

  onSearch() {
    // Computed signal handles this
  }

  completeLesson(lesson: Lesson) {
    this.lessonService.patchLesson(lesson.id, { status: 'completed' }).subscribe(() => {
      this.refreshSchedule();
    });
  }

  cancelLesson(lesson: Lesson) {
    this.trafService.showConfirm('Are you sure you want to cancel this lesson?', 'CANCEL').subscribe(() => {
      this.lessonService.cancelLesson(lesson.id).subscribe(() => {
        this.trafService.showNotification('Lesson canceled', 'success');
        this.refreshSchedule();
      });
    });
  }

  private formatForDateTimeLocal(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  reschedule(lesson: Lesson) {
    const dialogRef = this.dialog.open(DynamicFormComponent, {
      width: '500px',
      data: {
        title: 'Reschedule Lesson',
        submitText: 'Update',
        fields: [
          {
            key: 'title',
            label: 'Lesson Title',
            type: 'text',
            required: true,
            value: lesson.title,
            icon: 'edit'
          },
          {
            key: 'startTime',
            label: 'Date & Time',
            type: 'datetime-local',
            required: true,
            value: this.formatForDateTimeLocal(lesson.startTime),
            icon: 'calendar_today'
          },
          {
            key: 'durationMinutes',
            label: 'Duration (min)',
            type: 'number',
            required: true,
            value: lesson.durationMinutes || 60,
            icon: 'timer'
          },
          {
            key: 'location',
            label: 'Location',
            type: 'text',
            value: lesson.location,
            icon: 'location_on'
          },
          {
            key: 'type',
            label: 'Lesson Type',
            type: 'select',
            options: [
              { value: 'private', label: 'Private' },
              { value: 'group', label: 'Group' }
            ],
            value: (lesson.type || 'group').toLowerCase(),
            icon: 'people'
          },
          {
            key: 'notes',
            label: 'Notes',
            type: 'textarea',
            value: lesson.notes,
            icon: 'notes'
          }
        ]
      }
    });

    dialogRef.componentInstance.submitted.subscribe((data: any) => {
      // Partial updates: only send fields that have changed
      const patch: any = {};

      if (data.title !== lesson.title) patch.title = data.title;

      const newStart = new Date(data.startTime).toISOString();
      const oldStart = new Date(lesson.startTime).toISOString();
      if (newStart !== oldStart) patch.startTime = newStart;

      const newDur = Number(data.durationMinutes);
      if (newDur !== (lesson.durationMinutes || 60)) patch.durationMinutes = newDur;

      if (data.location !== lesson.location) patch.location = data.location;
      if (data.type !== (lesson.type || 'group').toLowerCase()) patch.type = data.type;
      if (data.notes !== lesson.notes) patch.notes = data.notes;

      if (Object.keys(patch).length === 0) {
        dialogRef.close();
        this.trafService.showNotification('No changes made', 'info');
        return;
      }

      this.lessonService.patchLesson(lesson.id, patch).subscribe(() => {
        dialogRef.close();
        this.trafService.showNotification('Lesson updated', 'success');
        this.refreshSchedule();
      });
    });
  }

  messageStudent(lesson: Lesson) {
    this.trafService.showNotification(`Opening chat with ${lesson.studentName || 'students'}...`, 'info');
    // Logic to navigate to /dashboard/messages with this user selected
  }
}
