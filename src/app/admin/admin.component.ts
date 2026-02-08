
import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraffiquizService } from '../traffiquiz.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';

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
  currentExamDuration!: number;
  loggedUser: any;
  isLoading: boolean = true;
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

  updateStudentForm = new FormGroup({
    updateUsername: new FormControl('', Validators.required),
    updateFirstName: new FormControl('', Validators.required),
    updateLastName: new FormControl('', Validators.required),
    updatePassword: new FormControl('', Validators.required),
    updateEmail: new FormControl('', Validators.required),
    updateUid: new FormControl('', Validators.required)
  });

  ngOnInit(): void {
    this.getAdminData.fetchStudents();
    this.getAdminData.fetchExamDuration().subscribe(duration => {
      this.currentExamDuration = duration;
    });
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.currentExamDuration / 60);
    const seconds = this.currentExamDuration % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

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
            this.currentExamDuration = response.new_time;
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

  btnEdit(event: Event): void {
    const clickedBtn = event.target as HTMLButtonElement; //Ensure type safety
    this.chosenUser = this.usersList().find((obj: any) => obj.id === parseInt(clickedBtn.id));
    this.updateStudentForm.controls['updateFirstName'].setValue(this.chosenUser['firstName']);
    this.updateStudentForm.controls.updateLastName.setValue(this.chosenUser.lastName ?? '');
    this.updateStudentForm.controls.updateUsername.setValue(this.chosenUser.username ?? '');
    this.updateStudentForm.controls.updateEmail.setValue(this.chosenUser.email ?? '');
    this.updateStudentForm.controls.updatePassword.setValue(this.chosenUser.password ?? '');
    this.updateStudentForm.controls.updateUid.setValue(this.chosenUser.id ?? '');
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

  deleteStudent(e: Event): void {
    const clickedBtn = e.target as HTMLButtonElement;
    const str = clickedBtn.id;
    const splitArray = str.split(".");
    const id = parseInt(splitArray[1]);
    const studentToDelete = this.usersList().find(student => student.id === id);
    if (studentToDelete) {
      this.getAdminData.deleteStudent(studentToDelete).subscribe({
        next: (res) => {
          if (res.success) {
            this.getAdminData.showNotification(res.message, 'success');
          }
        },
        error: (err) => {
          this.getAdminData.showNotification(err, 'error');
        },
        complete: () => {
          this.getAdminData.fetchStudents();
        }
      });
    }
  }

  /*
  deleteStudent(student: any): void {
    this.getAdminData.showConfirm(
      `Are you sure you want to delete ${student.firstName} ${student.lastName}?`,
      'Delete',
      'Confirm Deletion'
    ).subscribe(() => {
      this.getAdminData.deleteStudent(student.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.getAdminData.showNotification('Student deleted successfully', 'success');
            this.getAdminData.fetchStudents();
          }
        },
        error: (err) => {
          this.getAdminData.showNotification('Error deleting student: ' + err, 'error');
        }
      });
    });
  }*/

  updateStudent(): void {
    if (this.updateStudentForm.valid) {
      const payload = {
        id: this.updateStudentForm.value.updateUid,
        username: this.updateStudentForm.value.updateUsername,
        firstName: this.updateStudentForm.value.updateFirstName,
        lastName: this.updateStudentForm.value.updateLastName,
        email: this.updateStudentForm.value.updateEmail,
        password: this.updateStudentForm.value.updatePassword
      };

      this.getAdminData.updateStudent(payload).subscribe({
        next: (res) => {
          if (res.success) {
            this.getAdminData.showNotification(res.message, 'success');
          }
        },
        error: (err) => {
          this.getAdminData.showNotification(err, 'error');
        }
      });
    } else {
      this.getAdminData.showNotification('Fill all required details', 'error');
    }
  }

  ngOnDestroy(): void {
  }
}
