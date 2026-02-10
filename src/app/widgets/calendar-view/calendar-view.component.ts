import { Component, input, output, signal, computed } from '@angular/core';
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

export interface TrafQuizEventMeta {
  type: 'individual' | 'group' | 'theory' | 'unassigned';
  instructorId?: number;
  instructor?: {
    id: number;
    name: string;
  };
  lessonId?: number;
  isPast?: boolean;
}

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
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent {
  events = input<CalendarEvent<TrafQuizEventMeta>[]>([]);
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

  tooltipEvent = signal<CalendarEvent<TrafQuizEventMeta> | null>(null);
  tooltipPosition = signal({ x: 0, y: 0 });

  /**
   * Transforms raw events into TrafQuiz events once.
   * This avoids repeated mapping in every change detection cycle.
   */
  transformedEvents = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.events().map(e => ({
      ...e,
      resizable: e.resizable || {
        beforeStart: true,
        afterEnd: true,
      },
      draggable: e.draggable ?? true,
      meta: {
        ...e.meta,
        isPast: e.start < today
      } as TrafQuizEventMeta
    }));
  });

  /**
   * Filters already transformed events based on search and selected filters.
   */
  filteredEvents = computed(() => {
    let evs = this.transformedEvents();
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
      const id = Number(instructor);
      evs = evs.filter(e => e.meta && e.meta.instructorId === id);
    }

    return evs;
  });

  /**
   * Pre-groups transformed events by instructor.
   * This is much more efficient than filtering events for each instructor in the template.
   */
  eventsByInstructor = computed(() => {
    const events = this.transformedEvents();
    const grouped = new Map<number, CalendarEvent<TrafQuizEventMeta>[]>();

    events.forEach(e => {
      const instructorId = e.meta?.instructorId;
      if (instructorId) {
        if (!grouped.has(instructorId)) {
          grouped.set(instructorId, []);
        }
        grouped.get(instructorId)!.push(e);
      }
    });

    return grouped;
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
      const id = Number(instructor);
      return this.instructors().filter(i => i.id === id);
    }
    return this.instructors();
  });

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

  showTooltip(mouseEvent: MouseEvent, event: CalendarEvent) {
    this.tooltipEvent.set(event as CalendarEvent<TrafQuizEventMeta>);
    this.tooltipPosition.set({ x: mouseEvent.clientX, y: mouseEvent.clientY });
  }

  hideTooltip() {
    this.tooltipEvent.set(null);
  }

  // Template helpers for type safety
  asTrafQuizEvents(events: CalendarEvent[] | undefined | null): CalendarEvent<TrafQuizEventMeta>[] {
    return (events || []) as CalendarEvent<TrafQuizEventMeta>[];
  }

  asTrafQuizEvent(event: CalendarEvent): CalendarEvent<TrafQuizEventMeta> {
    return event as CalendarEvent<TrafQuizEventMeta>;
  }
}
