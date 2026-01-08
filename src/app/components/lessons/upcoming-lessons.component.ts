import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lesson } from '../../models/lesson';
import { LessonService } from '../../services/lesson.service';
import { LessonCardComponent } from './lesson-card.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-upcoming-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonCardComponent, MatIconModule],
  templateUrl: './upcoming-lessons.component.html',
  styleUrls: ['./upcoming-lessons.component.css']
})
export class UpcomingLessonsComponent implements OnInit {
  lessons: Lesson[] = [];
  selectedLesson: Lesson | null = null;
  range: 'today' | '7days' | 'week' | 'month' = '7days';
  q = '';

  constructor(private lessonService: LessonService) { }

  ngOnInit(): void {
    this.loadLessons();
  }

  loadLessons() {
    this.lessonService.getLessons(this.range).subscribe((ls) => {
      // sort ascending by startTime
      this.lessons = ls.slice().sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      // Auto-select first lesson if none selected or if previously selected lesson is no longer in list
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
      if (q) {
        return (l.title + ' ' + l.instructor.name + ' ' + (l.subject || '')).toLowerCase().includes(q);
      }
      return true;
    });
  }

  selectLesson(l: Lesson) {
    this.selectedLesson = l;
  }

  join(lesson: Lesson | null) {
    if (!lesson) return;
    this.lessonService.joinLesson(lesson.id).subscribe((res) => {
      // For now, show meeting link in console; later show modal/toast
      console.log('Joined lesson:', res);
      alert('Joined: ' + (res.meetingLink || 'success'));
    });
  }

  cancel(lesson: Lesson | null) {
    if (!lesson) return;
    if (!confirm('Cancel this lesson?')) return;
    this.lessonService.cancelLesson(lesson.id).subscribe(() => {
      // local state updated by service
      alert('Lesson cancelled');
    });
  }

  message(lesson: Lesson | null) {
    if (!lesson) return;
    // In future open messages modal; for now open prompt
    const msg = prompt(`Message to ${lesson.instructor.name}`);
    if (!msg) return;
    // TODO: wire to MessagesService
    alert('Message sent (mock): ' + msg);
  }
}
