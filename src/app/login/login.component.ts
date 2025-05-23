import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TraffiquizService } from '../traffiquiz.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule,MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private loadData: TraffiquizService = inject(TraffiquizService);
  private router: Router = inject(Router);
  public alert: MatDialog = inject(MatDialog);
  isLoading = false;
  public USER: any;

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  constructor() { }

  loadLicence() {

  }

  Login() {
    if (this.loginForm.valid) {
      const payload = { username: this.loginForm.value.username, password: this.loginForm.value.password };
      this.isLoading = true;
      this.loadData.login(payload).pipe(finalize(() => this.isLoading = false)).subscribe({
        next: (res) => {
          this.USER = res;
          localStorage.setItem('user', JSON.stringify({
            username: this.USER['username'],
            token: this.USER['token'],
			role: this.USER['role']
          }));
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          const data = {
            title: 'Error',
            message: `Error fetching data: ${JSON.stringify(err)}`,
            type: 'error',
            buttonText: 'OK'
          };
          this.openAlertDialog(data);
        },
        complete: () => {
          if (this.USER['status'] == 200) {
            if (this.USER['role'] == 'user') {
              this.router.navigate(['/exam']);
            } else {
              this.router.navigate(['/dashboard']);
            }
          } else {
            const data = {
              title: 'Error',
              message: 'Failed to load data',
              type: 'error',
              buttonText: 'OK'
            };
            this.openAlertDialog(data);
          }
        }
      });
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

  openAlertDialog(data: any): void {
    this.alert.open(AlertComponent, {
      data: data
    });
  }
}
