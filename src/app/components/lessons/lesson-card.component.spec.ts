import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LessonCardComponent } from './lesson-card.component';
import { Lesson } from '../../models/lesson';

describe('LessonCardComponent', () => {
  let component: LessonCardComponent;
  let fixture: ComponentFixture<LessonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LessonCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonCardComponent);
    component = fixture.componentInstance;
    component.lesson = { id: 1, title: 'Test', startTime: new Date().toISOString(), instructor: { id: 1, name: 'A' }, status: 'upcoming', studentCount: 0 } as Lesson;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.title')?.textContent).toContain('Test');
  });
});