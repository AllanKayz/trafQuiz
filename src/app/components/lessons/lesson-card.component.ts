import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Lesson } from '../../models/lesson';

@Component({
  selector: 'app-lesson-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lesson-card.component.html',
  styleUrls: ['./lesson-card.component.css']
})
export class LessonCardComponent {
  @Input() lesson!: Lesson;
  @Input() selected = false;

  statusLabel(status: Lesson['status']) {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      case 'rescheduled':
        return 'Rescheduled';
      default:
        return status;
    }
  }
}
