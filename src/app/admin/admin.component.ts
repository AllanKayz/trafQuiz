import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TraffiquizService } from '../traffiquiz.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, MatFormFieldModule, ReactiveFormsModule, MatProgressSpinnerModule, MatDialogModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  adminData: any;
  currentExamDuration!: number;
  loggedUser: any;
  isLoading: boolean = true;
  chosenUser: any;


  public alertDialog: MatDialog = inject(MatDialog);
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

  async ngOnInit() {
    await this.getAdminData.fetchStudents();
    await this.getAdminData.fetchExamDuration();
    this.currentExamDuration = this.getAdminData.examDuration();
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.currentExamDuration / 60);
    const seconds = this.currentExamDuration % 60;
    return `${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  private pad(value: number): string {
    return value < 10 ? '0' + value : value.toString();
  }

  async updateExamDuration() {
    let newtime: any;
    if (this.examTime.valid) {
      newtime = this.examTime.value.newtime;
      newtime = newtime * 60;
      const payload = { time: newtime };
      try {
        const response: any = await this.getAdminData.setExamTimeframe(payload);
        if (response.success) {
          const data = {
            title: 'Notification',
            message: response.message,
            type: 'success',
            buttonText: 'OK'
          };
          this.examTime.reset();
          this.openAlertDialog(data);
          this.currentExamDuration = response.new_time;
        }
      } catch (err) {
        const data = {
          title: 'Error',
          message: err,
          type: 'error',
          buttonText: 'OK'
        };
        this.openAlertDialog(data);
      }

    } else {
      const data = {
        title: 'Error',
        message: 'No Change Made, Input new time',
        type: 'error',
        buttonText: 'OK'
      };
      this.openAlertDialog(data);
      newtime = 300;
    }
  }

  async addStudent() {
    if (this.addStudentForm.valid) {
      const payload = {
        username: this.addStudentForm.value.username?.trim(),
        firstName: this.addStudentForm.value.firstName?.trim(),
        lastName: this.addStudentForm.value.lastName?.trim(),
        email: this.addStudentForm.value.email?.trim(),
        password: this.addStudentForm.value.password?.trim()
      };

      try {
        const res: any = await this.getAdminData.addInstructor(payload);
        if (res.success) {
          const data = {
            title: 'Notification',
            message: res.message,
            type: 'success',
            buttonText: 'OK'
          };
          this.addStudentForm.reset();
          this.openAlertDialog(data);
          await this.getAdminData.fetchStudents();
        }
      } catch (err) {
        const data = {
          title: 'Error',
          message: err,
          type: 'error',
          buttonText: 'OK'
        };
        this.openAlertDialog(data);
      }
    } else {
      const data = {
        title: 'Error',
        message: 'Fill all required details',
        type: 'error',
        buttonText: 'OK'
      };
      this.openAlertDialog(data);
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

  async deleteStudent(e: Event) {
    const clickedBtn = e.target as HTMLButtonElement;
    const str = clickedBtn.id;
    const splitArray = str.split(".");
    const id = parseInt(splitArray[1]);
    const studentToDelete = this.usersList().find(student => student.id === id);
    if (studentToDelete) {
      try {
        const res: any = await this.getAdminData.deleteStudent(studentToDelete.id);
        if (res.success) {
          const data = {
            title: 'Notification',
            message: res.message,
            type: 'success',
            buttonText: 'OK'
          };;
          this.openAlertDialog(data);
          await this.getAdminData.fetchStudents();
        }
      } catch (err) {
        const data = {
          title: 'Error',
          message: err,
          type: 'error',
          buttonText: 'OK'
        };
        this.openAlertDialog(data);
      }
    }
  }

  async updateStudent() {
    if (this.updateStudentForm.valid) {
      const payload = {
        id: this.updateStudentForm.value.updateUid,
        username: this.updateStudentForm.value.updateUsername,
        firstName: this.updateStudentForm.value.updateFirstName,
        lastName: this.updateStudentForm.value.updateLastName,
        email: this.updateStudentForm.value.updateEmail,
        password: this.updateStudentForm.value.updatePassword
      };

      try {
        const res: any = await this.getAdminData.updateStudent(payload);
        if (res.success) {
          const data = {
            title: 'Notification',
            message: res.message,
            type: 'success',
            buttonText: 'OK'
          };
          this.openAlertDialog(data);
          await this.getAdminData.fetchStudents();
        }
      } catch (err) {
        const data = {
          title: 'Error',
          message: err,
          type: 'error',
          buttonText: 'OK'
        };
        this.openAlertDialog(data);
      }
    } else {
      const data = {
        title: 'Error',
        message: 'Fill all required details',
        type: 'error',
        buttonText: 'OK'
      };
      this.openAlertDialog(data);
    }
  }

  ngOnDestroy(): void {

  }

  openAlertDialog(data: any): void {
    this.alertDialog.open(AlertComponent, {
      data: data
    });
  }
}
