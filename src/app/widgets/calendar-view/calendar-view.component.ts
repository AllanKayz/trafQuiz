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
      <div class="calendar-header-bar">
        <div class="header-start">
          <div class="title-group">
            <h2 class="current-period">{{ viewDate | date: (view() === CalendarView.Month ? 'MMMM yyyy' : 'MMM d, yyyy') }}</h2>
          </div>
          <div class="nav-group">
            <button mat-icon-button mwlCalendarPreviousView [view]="view()" [(viewDate)]="viewDate" (viewDateChange)="refresh.next()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <button mat-icon-button mwlCalendarNextView [view]="view()" [(viewDate)]="viewDate" (viewDateChange)="refresh.next()">
              <mat-icon>chevron_right</mat-icon>
            </button>
            <button mat-stroked-button class="today-btn" mwlCalendarToday [(viewDate)]="viewDate" (viewDateChange)="refresh.next()">
              Today
            </button>
          </div>
        </div>

        <div class="header-end">
          <div class="search-filter-compact">
             <mat-form-field appearance="outline" class="compact-field" subscriptSizing="dynamic">
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [ngModel]="searchText()" (ngModelChange)="searchText.set($event); onFilterChange()" placeholder="Search">
            </mat-form-field>
             <mat-form-field appearance="outline" class="compact-field" subscriptSizing="dynamic">
              <mat-select [ngModel]="filterType()" (selectionChange)="filterType.set($event.value); onFilterChange()" placeholder="Type">
                <mat-option value="all">All Types</mat-option>
                <mat-option value="individual">Individual</mat-option>
                <mat-option value="group">Group</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="compact-field" subscriptSizing="dynamic">
              <mat-select [ngModel]="filterInstructor()" (selectionChange)="filterInstructor.set($event.value); onFilterChange()" placeholder="Instructor">
                <mat-option value="all">All Instructors</mat-option>
                @for (instructor of instructors(); track instructor.id) {
                  <mat-option [value]="instructor.id">{{ instructor.firstName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <mat-button-toggle-group [value]="viewMode()" (change)="setViewMode($event.value)" class="view-toggle">
            <mat-button-toggle value="month">Month</mat-button-toggle>
            <mat-button-toggle value="week">Week</mat-button-toggle>
            <mat-button-toggle value="day">Day</mat-button-toggle>
            <mat-button-toggle value="resources">Resources</mat-button-toggle>
          </mat-button-toggle-group>
        </div>
      </div>

      <div class="calendar-body google-style"
           mwlDroppable (drop)="externalDrop($event)">
        @switch (viewMode()) {
          @case ('month') {
            <mwl-calendar-month-view
          [viewDate]="viewDate"
          [events]="filteredEvents()"
          [refresh]="refresh"
          [activeDayIsOpen]="activeDayIsOpen"
          [cellTemplate]="monthCellTemplate"
          (dayClicked)="handleDayClick($event.day.date, $event.day.events)"
          (eventClicked)="eventClicked.emit($event.event)"
          (eventTimesChanged)="eventTimesChanged.emit($event)">
        </mwl-calendar-month-view>
          }
          @case ('week') {
            <mwl-calendar-week-view
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
          }
          @case ('day') {
            <mwl-calendar-day-view
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
          }
          @case ('resources') {
            <div class="resource-view-container">
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
          }
        }

        <ng-template #monthCellTemplate let-day="day" let-openDay="openDay" let-locale="locale">
          <div class="cal-cell-top" mwlDroppable (drop)="externalDropOnDate($event, day.date)">
            <span class="cal-day-number">{{ day.date | calendarDate:'monthViewDayNumber':locale }}</span>
          </div>
          @if (day.events.length > 0) {
            <div class="cal-events">
              @for (event of $any(day.events) | slice:0:2; track $any(event).id) {
                <div class="cal-event-chip"
                     [style.backgroundColor]="$any(event).color?.primary || 'var(--primary-color)'"
                     [style.borderColor]="$any(event).color?.primary || 'var(--primary-color)'"
                     (click)="eventClicked.emit($any(event))"
                     [matTooltip]="$any(event).title">
                  {{ $any(event).title }}
                </div>
              }
              @if (day.events.length > 2) {
                <div class="cal-more-events">
                  +{{ day.events.length - 2 }} more
                </div>
              }
            </div>
          }
        </ng-template>

        <ng-template #eventTemplate let-weekEvent="weekEvent" let-tooltipPlacement="tooltipPlacement">
          <div class="custom-event-card"
               [style.border-left-color]="$any(weekEvent).event.color?.primary"
               [matTooltip]="$any(weekEvent).event.title"
               (click)="eventClicked.emit($any(weekEvent).event)">
            <div class="event-time">
              {{ $any(weekEvent).event.start | date:'HH:mm' }} - {{ $any(weekEvent).event.end | date:'HH:mm' }}
            </div>
            <div class="event-title">{{ $any(weekEvent).event.title }}</div>
            @if ($any(weekEvent).event.meta?.instructor) {
              <div class="event-instructor">
              <mat-icon>person</mat-icon>
              <span>{{ $any(weekEvent).event.meta.instructor.name }}</span>
            </div>
            }
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
    :host {
      display: block;
      --cal-grid-border: #dadce0;
      --cal-bg: #ffffff;
      --cal-today-bg: transparent;
      --cal-weekend-bg: #ffffff;
      --google-blue: #1a73e8;
      --text-primary: #3c4043;
      --text-secondary: #70757a;
    }

    .calendar-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      font-family: var(--font-sans);
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .calendar-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .header-start {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .header-end {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .nav-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .search-filter-compact {
      display: flex;
      gap: 8px;
    }

    .compact-field {
      width: 140px;
      font-size: 13px;
    }
    
    .compact-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .today-btn {
      border-color: #dadce0;
      color: #3c4043;
      font-weight: 500;
    }

    .current-period {
      margin: 0;
      font-size: 1.375rem;
      font-weight: 400;
      color: var(--text-primary);
      text-transform: capitalize;
    }

    .calendar-body {
      background: var(--cal-bg);
      border: none;
      overflow: hidden;
      min-height: 700px;
    }

    .calendar-legend {
      display: flex;
      gap: 24px;
      padding: 12px 0;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }

    .dot.individual { background-color: #3b82f6; }
    .dot.group { background-color: #8b5cf6; }
    .dot.unassigned { background-color: #f59e0b; }

    /* Customizing angular-calendar styles */
    ::ng-deep .cal-month-view {
      background-color: transparent !important;
    }

    ::ng-deep .cal-month-view .cal-header {
      border-bottom: none;
      padding-bottom: 0;
    }

    ::ng-deep .cal-month-view .cal-header .cal-cell {
      padding: 8px 0;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 11px;
      color: var(--text-secondary);
      border: none;
    }

    ::ng-deep .cal-month-view .cal-days {
      border: 1px solid var(--cal-grid-border);
      border-bottom: none;
      border-right: none;
    }

    ::ng-deep .cal-month-view .cal-day-cell {
      min-height: 120px !important;
      border-right: 1px solid var(--cal-grid-border);
      border-bottom: 1px solid var(--cal-grid-border);
    }

    ::ng-deep .cal-month-view .cal-day-cell:hover {
      background-color: #f1f3f4 !important;
    }

    ::ng-deep .cal-month-view .cal-day-cell.cal-weekend {
      background-color: var(--cal-weekend-bg);
    }

    ::ng-deep .cal-month-view .cal-day-cell.cal-today {
      background-color: var(--cal-today-bg) !important;
    }

    ::ng-deep .cal-month-view .cal-cell-top {
      min-height: unset !important;
      padding: 8px;
      display: flex;
      justify-content: center; /* Center day number like Google */
    }

    ::ng-deep .cal-month-view .cal-day-number {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-primary);
      opacity: 0.8;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin-bottom: 4px;
    }

    ::ng-deep .cal-month-view .cal-today .cal-day-number {
      background-color: var(--google-blue);
      color: #fff;
      opacity: 1;
    }

    .cal-events {
      padding: 0 4px 4px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }

    .cal-event-chip {
      font-size: 12px;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
      cursor: pointer;
      line-height: 1.4;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .cal-event-chip:hover {
      opacity: 0.9;
    }

    .cal-more-events {
      font-size: 11px;
      color: var(--text-primary);
      font-weight: 600;
      padding-left: 8px;
      cursor: pointer;
    }

    ::ng-deep .cal-week-view .cal-day-headers {
      border-bottom: 1px solid var(--cal-grid-border) !important;
    }

    ::ng-deep .cal-week-view .cal-header.cal-today {
      background-color: var(--cal-today-bg) !important;
    }

    ::ng-deep .cal-week-view .cal-time-events {
      border-color: var(--cal-grid-border) !important;
    }

    ::ng-deep .cal-week-view .cal-hour-segment {
      border-bottom: 1px dotted var(--cal-grid-border);
    }

    ::ng-deep .cal-week-view .cal-hour:not(:last-child) .cal-hour-segment,
    ::ng-deep .cal-week-view .cal-hour:last-child :not(:last-child) .cal-hour-segment {
      border-bottom-color: var(--cal-grid-border);
    }

    ::ng-deep .cal-week-view .cal-hour-segment:hover {
      background-color: var(--hover-bg) !important;
    }

    .custom-event-card {
      height: 100%;
      padding: 6px 10px;
      font-size: 0.75rem;
      border-left: 4px solid var(--primary-color);
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid var(--border-color);
      border-left-width: 4px;
    }

    .custom-event-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      z-index: 10;
    }

    .event-time {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    .event-title {
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.8rem;
    }

    .event-instructor {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: auto;
    }

    .event-instructor mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }

    .resource-view-container {
      display: flex;
      overflow-x: auto;
      gap: 1px;
      background: var(--cal-grid-border);
      height: 750px;
    }

    .resource-column {
      flex: 1;
      min-width: 280px;
      background: var(--bg-card);
      display: flex;
      flex-direction: column;
    }

    .resource-header {
      padding: 16px;
      background: hsla(var(--primary) / 0.05);
      border-bottom: 1px solid var(--cal-grid-border);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-weight: 700;
      color: var(--primary-color);
      position: sticky;
      top: 0;
      z-index: 10;
      font-family: var(--font-display);
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
      .calendar-header-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .header-start, .header-end {
        flex-direction: column;
        width: 100%;
        gap: 12px;
      }
      .compact-field {
        width: 100%;
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

  searchText = signal('');
  filterType = signal('all');
  filterInstructor = signal('all');

  filteredEvents = computed(() => {
    let evs = this.events();
    const search = this.searchText().toLowerCase();
    const type = this.filterType();
    const instructor = this.filterInstructor();

    if (search) {
      evs = evs.filter(e =>
        e.title.toLowerCase().includes(search) ||
        (e.meta && e.meta.instructor && e.meta.instructor.name.toLowerCase().includes(search))
      );
    }

    if (type !== 'all') {
      evs = evs.filter(e => e.meta && e.meta.type === type);
    }

    if (instructor !== 'all') {
      evs = evs.filter(e => e.meta && e.meta.instructorId === instructor);
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
    const instructor = this.filterInstructor();
    if (instructor !== 'all') {
      return this.instructors().filter(i => i.id === instructor);
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
