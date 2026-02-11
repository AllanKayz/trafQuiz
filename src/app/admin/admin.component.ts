
import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraffiquizService } from '../traffiquiz.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, take } from 'rxjs';

import { ManageMetadataComponent } from '../components/admin/manage-metadata/manage-metadata.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EditStudentDialogComponent } from './edit-student-dialog.component';

@Component({
  selector: 'app-admin',
  imports: [
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatTabsModule,
    ManageMetadataComponent,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit, OnDestroy {
  adminData: any;
  currentExamDuration = signal<number>(1800);
  loggedUser: any;
  isLoading = signal<boolean>(true);
  chosenUser: any;
  dialog = inject(MatDialog);


  getAdminData: TraffiquizService = inject(TraffiquizService);
  usersList = this.getAdminData.studentsSignal;

  examTime = new FormGroup({
    newtime: new FormControl('', Validators.required),
  });

  addStudentForm = new FormGroup({
    username: new FormControl('', Validators.required),
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.getAdminData.fetchStudents();
    this.getAdminData.fetchExamDuration().pipe(
      take(1),
      finalize(() => this.isLoading.set(false))
    ).subscribe(duration => {
      this.currentExamDuration.set(duration);
    });
  }

  formattedTime = computed(() => {
    const duration = this.currentExamDuration();
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  });

  private pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  updateExamDuration(): void {
    let newtime: any;
    if (this.examTime.valid) {
      newtime = this.examTime.value.newtime;
      newtime = newtime * 60;
      const payload = { time: newtime };
      this.getAdminData.setExamTimeframe(payload).subscribe({
        next: (response) => {
          if (response.success) {
            this.getAdminData.showNotification(response.message, 'success');
            this.examTime.reset();
            this.currentExamDuration.set(response.new_time);
          }
        },
        error: (err) => {
          this.getAdminData.showNotification(err, 'error');
        }
      });

    } else {
      this.getAdminData.showNotification('No Change Made, Input new time', 'error');
      newtime = 300;
    }
  }

  addStudent(): void {
    if (this.addStudentForm.valid) {
      const payload = {
        username: this.addStudentForm.value.username?.trim(),
        firstName: this.addStudentForm.value.firstName?.trim(),
        lastName: this.addStudentForm.value.lastName?.trim(),
        email: this.addStudentForm.value.email?.trim(),
        password: this.addStudentForm.value.password?.trim()
      };


      this.getAdminData.addInstructor(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.getAdminData.showNotification(res.message, 'success');
            this.addStudentForm.reset();
          }
        },
        error: (err) => {
          this.getAdminData.showNotification(err, 'error');
        },
        complete: () => {
          this.getAdminData.fetchStudents();
        }
      });
    } else {
      this.getAdminData.showNotification('Fill all required details', 'error');
    }

  }

  editStudent(student: any): void {
    const dialogRef = this.dialog.open(EditStudentDialogComponent, {
      data: student,
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.chosenUser = result;
        const payload = {
          id: result.updateUid,
          username: result.updateUsername,
          firstName: result.updateFirstName,
          lastName: result.updateLastName,
          email: result.updateEmail,
          password: result.updatePassword
        };
        this.getAdminData.updateStudent(payload).subscribe({
          next: (res) => {
            if (res.success) {
              this.getAdminData.showNotification(res.message, 'success');
              this.getAdminData.fetchStudents();
            }
          },
          error: (err) => {
            this.getAdminData.showNotification(err, 'error');
          }
        });
      }
    });
  }

  deleteStudent(student: any): void {
    if (student && student.id) {
      this.getAdminData.showConfirm(
        `Are you sure you want to delete student ${student.firstName} ${student.lastName}?`,
        'Delete',
        'Confirm Deletion'
      ).subscribe(() => {
        this.getAdminData.deleteStudent(student.id).subscribe({
          next: (res) => {
            if (res.success) {
              this.getAdminData.showNotification(res.message, 'success');
              this.getAdminData.fetchStudents();
            }
          },
          error: (err) => {
            this.getAdminData.showNotification(err, 'error');
          }
        });
      });
    }
  }

  ngOnDestroy(): void {
  }
}
