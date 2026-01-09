import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LessonService } from '../../../services/lesson.service';
import { TraffiquizService } from '../../../traffiquiz.service';
import { Lesson } from '../../../models/lesson';

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
    const userId = this.user()?.id;
    this.lessonService.getLessons().subscribe(ls => {
      // In a real app, query by instructorId.
      const filtered = ls.filter(l => l.instructor.id === userId);
      this.myLessons.set(filtered);
    });
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
    if (confirm('Are you sure you want to cancel this lesson?')) {
      this.lessonService.cancelLesson(lesson.id).subscribe(() => {
        this.refreshSchedule();
      });
    }
  }

  reschedule(lesson: Lesson) {
    const newDate = prompt('Enter new date/time (YYYY-MM-DD HH:mm):', lesson.startTime);
    if (newDate) {
      this.lessonService.patchLesson(lesson.id, { startTime: new Date(newDate).toISOString() }).subscribe(() => {
        this.refreshSchedule();
      });
    }
  }

  messageStudent(lesson: Lesson) {
    alert(`Opening chat with ${lesson.studentName || 'students'}...`);
    // Logic to navigate to /dashboard/messages with this user selected
  }
}
