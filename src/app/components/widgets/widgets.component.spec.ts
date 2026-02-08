import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WidgetsComponent } from './widgets.component';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

describe('WidgetsComponent', () => {
  let component: WidgetsComponent;
  let fixture: ComponentFixture<WidgetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetsComponent, MatDialogModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WidgetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
