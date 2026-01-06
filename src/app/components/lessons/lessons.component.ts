import { Component } from '@angular/core';

import { UpcomingLessonsComponent } from './upcoming-lessons.component';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [UpcomingLessonsComponent],
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css']
})
export class LessonsComponent {

}
