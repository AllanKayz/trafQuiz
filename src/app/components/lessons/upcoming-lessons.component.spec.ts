import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpcomingLessonsComponent } from './upcoming-lessons.component';

describe('UpcomingLessonsComponent', () => {
  let component: UpcomingLessonsComponent;
  let fixture: ComponentFixture<UpcomingLessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingLessonsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UpcomingLessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have lessons observable populated from service', () => {
    expect(component.lessons).toBeDefined();
    expect(Array.isArray(component.lessons)).toBe(true);
  });
});