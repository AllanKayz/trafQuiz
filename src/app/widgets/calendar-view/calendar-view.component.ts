import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CalendarModule,
  CalendarEvent,
  CalendarView,
  CalendarDateFormatter,
  DateAdapter,
  CalendarUtils,
  CalendarA11y,
  CalendarEventTitleFormatter
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  providers: [
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
    },
    CalendarUtils,
    CalendarDateFormatter,
    CalendarA11y,
    CalendarEventTitleFormatter
  ],
  template: `
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="navigation-group">
          <button mat-icon-button mwlCalendarPreviousView [view]="view()" [(viewDate)]="viewDate">
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button mat-stroked-button mwlCalendarToday [(viewDate)]="viewDate">
            Today
          </button>
          <button mat-icon-button mwlCalendarNextView [view]="view()" [(viewDate)]="viewDate">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <h3 class="current-month">{{ viewDate | date:'MMMM yyyy' }}</h3>
        </div>

        <mat-button-toggle-group [value]="view()" (change)="view.set($event.value)">
          <mat-button-toggle [value]="CalendarView.Month">Month</mat-button-toggle>
          <mat-button-toggle [value]="CalendarView.Week">Week</mat-button-toggle>
          <mat-button-toggle [value]="CalendarView.Day">Day</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div [ngSwitch]="view()" class="calendar-body">
        <mwl-calendar-month-view
          *ngSwitchCase="CalendarView.Month"
          [viewDate]="viewDate"
          [events]="events()"
          [refresh]="refresh"
          (eventClicked)="eventClicked.emit($event.event)"
          (dayClicked)="dayClicked.emit($event.day.date)">
        </mwl-calendar-month-view>

        <mwl-calendar-week-view
          *ngSwitchCase="CalendarView.Week"
          [viewDate]="viewDate"
          [events]="events()"
          [refresh]="refresh"
          (eventClicked)="eventClicked.emit($event.event)">
        </mwl-calendar-week-view>

        <mwl-calendar-day-view
          *ngSwitchCase="CalendarView.Day"
          [viewDate]="viewDate"
          [events]="events()"
          [refresh]="refresh"
          (eventClicked)="eventClicked.emit($event.event)">
        </mwl-calendar-day-view>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      background: var(--bg-card);
      border: var(--glass-border);
      border-radius: 16px;
      padding: 24px;
      box-shadow: var(--shadow-md);
    }
    .calendar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .navigation-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .current-month {
      margin: 0 16px;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-main);
    }
    .calendar-body {
      min-height: 600px;
    }
    /* Customizing angular-calendar styles for dark mode */
    ::ng-deep .cal-month-view {
      background-color: transparent !important;
      border-color: var(--border-color) !important;
    }
    ::ng-deep .cal-month-view .cal-cell-top {
      min-height: 100px;
    }
    ::ng-deep .cal-month-view .cal-day-cell {
      border-color: var(--border-color) !important;
    }
    ::ng-deep .cal-month-view .cal-day-cell:hover {
      background-color: var(--hover-bg) !important;
    }
    ::ng-deep .cal-month-view .cal-day-cell.cal-today {
      background-color: hsla(var(--primary) / 0.05) !important;
    }
    ::ng-deep .cal-event {
      background-color: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
    }
  `]
})
export class CalendarViewComponent {
  events = input<CalendarEvent[]>([]);
  eventClicked = output<CalendarEvent>();
  dayClicked = output<Date>();

  viewDate: Date = new Date();
  view = signal<CalendarView>(CalendarView.Month);
  CalendarView = CalendarView;
  refresh = new Subject<void>();
}
