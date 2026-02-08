import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionheaderComponent } from './sectionheader.component';

describe('SectionheaderComponent', () => {
  let component: SectionheaderComponent;
  let fixture: ComponentFixture<SectionheaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionheaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectionheaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('header', 'Test Header');
    fixture.componentRef.setInput('content', 'Test Content');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
