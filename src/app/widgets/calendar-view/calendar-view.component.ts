import { Component, input, output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CalendarModule,
  CalendarEvent,
  CalendarView,
  CalendarDateFormatter,
  DateAdapter,
  CalendarUtils,
  CalendarA11y,
  CalendarEventTitleFormatter,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { Subject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragAndDropModule } from 'angular-draggable-droppable';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    DragAndDropModule
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
    <div class="calendar-container animate-fade-in">
      <div class="calendar-controls">
        <div class="search-filter-group">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search events...</mat-label>
            <input matInput [(ngModel)]="searchText" (ngModelChange)="onFilterChange()" placeholder="e.g. Instructor name">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Filter by Type</mat-label>
            <mat-select [(ngModel)]="filterType" (selectionChange)="onFilterChange()">
              <mat-option value="all">All Lessons</mat-option>
              <mat-option value="individual">Individual</mat-option>
              <mat-option value="group">Group</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Instructor</mat-label>
            <mat-select [(ngModel)]="filterInstructor" (selectionChange)="onFilterChange()">
              <mat-option value="all">All Instructors</mat-option>
              @for (ins of instructors(); track ins.id) {
                <mat-option [value]="ins.id">{{ ins.firstName }} {{ ins.lastName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="view-navigation">
          <div class="nav-buttons">
            <button mat-icon-button mwlCalendarPreviousView [view]="view()" [(viewDate)]="viewDate" (viewDateChange)="refresh.next()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button mat-stroked-button mwlCalendarToday [(viewDate)]="viewDate" (viewDateChange)="refresh.next()">
              Today
            </button>
            <button mat-icon-button mwlCalendarNextView [view]="view()" [(viewDate)]="viewDate" (viewDateChange)="refresh.next()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
          <h2 class="current-period">{{ viewDate | date: (view() === CalendarView.Month ? 'MMMM yyyy' : 'MMM d, yyyy') }}</h2>
        </div>

        <mat-button-toggle-group [value]="viewMode()" (change)="setViewMode($event.value)">
          <mat-button-toggle value="month">Month</mat-button-toggle>
          <mat-button-toggle value="week">Week</mat-button-toggle>
          <mat-button-toggle value="day">Day</mat-button-toggle>
          <mat-button-toggle value="resources">Resources</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div [ngSwitch]="viewMode()" class="calendar-body premium-shadow"
           mwlDroppable (drop)="externalDrop($event)">
        <mwl-calendar-month-view
          *ngSwitchCase="'month'"
          [viewDate]="viewDate"
          [events]="filteredEvents()"
          [refresh]="refresh"
          [activeDayIsOpen]="activeDayIsOpen"
          [cellTemplate]="monthCellTemplate"
          (dayClicked)="handleDayClick($event.day.date, $event.day.events)"
          (eventClicked)="eventClicked.emit($event.event)"
          (eventTimesChanged)="eventTimesChanged.emit($event)">
        </mwl-calendar-month-view>

        <ng-template #monthCellTemplate let-day="day" let-openDay="openDay" let-locale="locale">
          <div class="cal-cell-top" mwlDroppable (drop)="externalDropOnDate($event, day.date)">
            <span class="cal-day-badge" *ngIf="day.badgeTotal > 0">{{ day.badgeTotal }}</span>
            <span class="cal-day-number">{{ day.date | calendarDate:'monthViewDayNumber':locale }}</span>
          </div>
          <div class="cal-events" *ngIf="day.events.length > 0">
            @for (event of day.events | slice:0:2; track $any(event).id) {
              <div class="cal-event-summary">
                {{ $any(event).title }}
              </div>
            }
            <div class="cal-more-events" *ngIf="day.events.length > 2">
              +{{ day.events.length - 2 }} more
            </div>
          </div>
        </ng-template>

        <mwl-calendar-week-view
          *ngSwitchCase="'week'"
          [viewDate]="viewDate"
          [events]="filteredEvents()"
          [refresh]="refresh"
          [hourSegments]="2"
          [dayStartHour]="7"
          [dayEndHour]="21"
          [eventTemplate]="eventTemplate"
          (eventClicked)="eventClicked.emit($event.event)"
          (eventTimesChanged)="eventTimesChanged.emit($event)">
        </mwl-calendar-week-view>

        <mwl-calendar-day-view
          *ngSwitchCase="'day'"
          [viewDate]="viewDate"
          [events]="filteredEvents()"
          [refresh]="refresh"
          [hourSegments]="2"
          [dayStartHour]="7"
          [dayEndHour]="21"
          [eventTemplate]="eventTemplate"
          (eventClicked)="eventClicked.emit($event.event)"
          (eventTimesChanged)="eventTimesChanged.emit($event)">
        </mwl-calendar-day-view>

        <div *ngSwitchCase="'resources'" class="resource-view-container">
          @for (instructor of selectedInstructors(); track instructor.id) {
            <div class="resource-column">
              <div class="resource-header">
                <mat-icon>person</mat-icon>
                <span>{{ instructor.firstName }}</span>
              </div>
              <mwl-calendar-day-view
                [viewDate]="viewDate"
                [events]="getEventsForInstructor(instructor.id)"
                [refresh]="refresh"
                [hourSegments]="1"
                [dayStartHour]="7"
                [dayEndHour]="21"
                [eventTemplate]="eventTemplate"
                (eventClicked)="eventClicked.emit($event.event)"
                (eventTimesChanged)="eventTimesChanged.emit($event)">
              </mwl-calendar-day-view>
            </div>
          } @empty {
            <div class="no-resources">
              <mat-icon>group_add</mat-icon>
              <p>Select instructors to compare schedules side-by-side</p>
            </div>
          }
        </div>

        <ng-template #eventTemplate let-weekEvent="weekEvent" let-tooltipPlacement="tooltipPlacement">
          <div class="custom-event-card"
               [style.border-left-color]="weekEvent.event.color?.primary"
               [matTooltip]="weekEvent.event.title"
               (click)="eventClicked.emit(weekEvent.event)">
            <div class="event-time">
              {{ weekEvent.event.start | date:'HH:mm' }} - {{ weekEvent.event.end | date:'HH:mm' }}
            </div>
            <div class="event-title">{{ weekEvent.event.title }}</div>
            <div class="event-instructor" *ngIf="weekEvent.event.meta?.instructor">
              <mat-icon>person</mat-icon>
              <span>{{ weekEvent.event.meta.instructor.name }}</span>
            </div>
          </div>
        </ng-template>
      </div>

      <div class="calendar-legend">
        <div class="legend-item">
          <span class="dot individual"></span>
          <span>Individual Lesson</span>
        </div>
        <div class="legend-item">
          <span class="dot group"></span>
          <span>Group Lesson</span>
        </div>
        <div class="legend-item">
          <span class="dot unassigned"></span>
          <span>Unassigned Vehicle</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .calendar-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding: 8px 0;
    }

    .search-filter-group {
      display: flex;
      gap: 12px;
      flex: 1;
      min-width: 300px;
    }

    .search-field, .filter-field {
      margin-bottom: 0;
    }

    .view-navigation {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .nav-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .current-period {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-main);
      font-family: var(--font-display);
    }

    .calendar-body {
      background: var(--bg-card);
      border: var(--glass-border);
      border-radius: 20px;
      overflow: hidden;
      min-height: 650px;
    }

    .calendar-legend {
      display: flex;
      gap: 24px;
      justify-content: center;
      padding: 12px;
      background: var(--hover-bg);
      border-radius: 12px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .dot.individual { background-color: #3b82f6; }
    .dot.group { background-color: #8b5cf6; }
    .dot.unassigned { background-color: #f59e0b; }

    /* Customizing angular-calendar styles */
    ::ng-deep .cal-month-view {
      background-color: transparent !important;
    }

    ::ng-deep .cal-month-view .cal-day-cell {
      min-height: 120px !important;
      transition: background 0.2s ease;
      display: flex;
      flex-direction: column;
    }

    .cal-events {
      padding: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .cal-event-summary {
      font-size: 0.7rem;
      background: hsla(var(--primary) / 0.1);
      border-left: 3px solid var(--primary-color);
      padding: 2px 4px;
      border-radius: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text-main);
    }

    .cal-more-events {
      font-size: 0.65rem;
      color: var(--text-muted);
      text-align: center;
      padding-top: 2px;
    }

    ::ng-deep .cal-month-view .cal-day-cell:hover {
      background-color: var(--hover-bg) !important;
    }

    ::ng-deep .cal-month-view .cal-cell-top {
      min-height: unset !important;
      padding: 8px;
    }

    ::ng-deep .cal-month-view .cal-day-number {
      font-size: 1rem;
      font-weight: 600;
      opacity: 0.7;
    }

    ::ng-deep .cal-month-view .cal-today .cal-day-number {
      color: var(--primary-color);
      opacity: 1;
      font-size: 1.25rem;
    }

    ::ng-deep .cal-event {
      border-radius: 4px !important;
      font-size: 0.75rem !important;
      padding: 2px 6px !important;
      font-weight: 500 !important;
    }

    ::ng-deep .cal-week-view .cal-day-headers {
      border-color: var(--border-color) !important;
    }

    ::ng-deep .cal-week-view .cal-time-events {
      border-color: var(--border-color) !important;
    }

    ::ng-deep .cal-week-view .cal-hour-segment:hover {
      background-color: var(--hover-bg) !important;
    }

    .custom-event-card {
      height: 100%;
      padding: 4px 8px;
      font-size: 0.75rem;
      border-left: 4px solid var(--primary-color);
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .custom-event-card:hover {
      transform: scale(1.02);
      box-shadow: var(--shadow-md);
      z-index: 10;
    }

    .event-time {
      font-size: 0.65rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    .event-title {
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-instructor {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.65rem;
      color: var(--text-muted);
    }

    .event-instructor mat-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }

    .resource-view-container {
      display: flex;
      overflow-x: auto;
      gap: 1px;
      background: var(--border-color);
      height: 650px;
    }

    .resource-column {
      flex: 1;
      min-width: 250px;
      background: var(--bg-card);
      display: flex;
      flex-direction: column;
    }

    .resource-header {
      padding: 12px;
      background: hsla(var(--primary) / 0.05);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 600;
      color: var(--primary-color);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .no-resources {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      padding: 40px;
    }

    .no-resources mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.2;
    }

    @media (max-width: 768px) {
      .calendar-controls {
        flex-direction: column;
        align-items: stretch;
      }
      .view-navigation {
        order: -1;
      }
    }
  `]
})
export class CalendarViewComponent {
  events = input<CalendarEvent[]>([]);
  instructors = input<any[]>([]);
  eventClicked = output<CalendarEvent>();
  dayClicked = output<Date>();
  eventTimesChanged = output<CalendarEventTimesChangedEvent>();
  externalEventDropped = output<{ date: Date, externalEvent: any }>();

  viewDate: Date = new Date();
  view = signal<CalendarView>(CalendarView.Month);
  viewMode = signal<string>('month');
  CalendarView = CalendarView;
  refresh = new Subject<void>();
  activeDayIsOpen = false;

  searchText = '';
  filterType = 'all';
  filterInstructor = 'all';

  filteredEvents = computed(() => {
    let evs = this.events();

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      evs = evs.filter(e =>
        e.title.toLowerCase().includes(search) ||
        (e.meta && e.meta.instructor && e.meta.instructor.name.toLowerCase().includes(search))
      );
    }

    if (this.filterType !== 'all') {
      evs = evs.filter(e => e.meta && e.meta.type === this.filterType);
    }

    if (this.filterInstructor !== 'all') {
      evs = evs.filter(e => e.meta && e.meta.instructorId === this.filterInstructor);
    }

    return evs;
  });

  onFilterChange() {
    this.activeDayIsOpen = false;
    this.refresh.next();
  }

  setViewMode(mode: string) {
    this.viewMode.set(mode);
    if (mode === 'month') this.view.set(CalendarView.Month);
    else if (mode === 'week') this.view.set(CalendarView.Week);
    else if (mode === 'day') this.view.set(CalendarView.Day);
    else if (mode === 'resources') this.view.set(CalendarView.Day);
    this.refresh.next();
  }

  selectedInstructors = computed(() => {
    if (this.filterInstructor !== 'all') {
      return this.instructors().filter(i => i.id === this.filterInstructor);
    }
    // For resource view, if "all" is selected, we might want to show a few or all.
    // Let's show all if in resource view.
    return this.instructors();
  });

  getEventsForInstructor(instructorId: number): CalendarEvent[] {
    return this.events().filter(e => e.meta && e.meta.instructorId === instructorId);
  }

  handleDayClick(date: Date, events: CalendarEvent[]) {
    if (events.length > 0) {
      if (this.viewDate.getTime() === date.getTime() && this.activeDayIsOpen) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
        this.viewDate = date;
      }
    } else {
      this.dayClicked.emit(date);
    }
  }

  externalDrop(event: any) {
    // Generic drop handler for the whole calendar body if not caught by specific date
    if (event.dropData && event.dropData.lesson) {
      this.externalEventDropped.emit({
        date: this.viewDate,
        externalEvent: event.dropData.lesson
      });
    }
  }

  externalDropOnDate(event: any, date: Date) {
    if (event.dropData && event.dropData.lesson) {
      this.externalEventDropped.emit({
        date: date,
        externalEvent: event.dropData.lesson
      });
      event.event.stopPropagation();
    }
  }
}
