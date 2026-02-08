import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExamComponent } from './exam.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ExamComponent', () => {
  let component: ExamComponent;
  let fixture: ComponentFixture<ExamComponent>;

  beforeEach(async () => {
    localStorage.setItem('user', JSON.stringify({ token: 'test-token', role: 'student' }));
    await TestBed.configureTestingModule({
      imports: [ExamComponent, NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
