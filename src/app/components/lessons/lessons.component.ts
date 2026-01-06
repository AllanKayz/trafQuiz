import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpcomingLessonsComponent } from './upcoming-lessons.component';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, UpcomingLessonsComponent],
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css']
})
export class LessonsComponent {

}
