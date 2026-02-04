import { Component, OnInit, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UpcomingLessonsComponent } from './upcoming-lessons.component';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [UpcomingLessonsComponent],
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.css']
})
export class LessonsComponent implements OnInit {
  @ViewChild(UpcomingLessonsComponent) upcomingLessonsComponent?: UpcomingLessonsComponent;

  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Force initial load when component is activated
    this.route.url.subscribe(() => {
      // Trigger change detection to ensure child component loads
      setTimeout(() => {
        this.upcomingLessonsComponent?.loadLessons();
        this.cdr.detectChanges();
      }, 0);
    });
  }
}
