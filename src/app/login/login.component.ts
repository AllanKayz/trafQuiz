import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
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
	imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatProgressSpinnerModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {
	private trafQuizService = inject(TraffiquizService);
	private router = inject(Router);
	public alert = inject(MatDialog);

	isLoading = signal(false);
	loginForm = new FormGroup({
		username: new FormControl('', Validators.required),
		password: new FormControl('', Validators.required)
	});

	constructor() { }

	loadLicence() {

	}

	login() {
		if (this.loginForm.valid) {
			this.isLoading.set(true);
			const payload = this.loginForm.value;

			this.trafQuizService.login(payload).pipe(
				finalize(() => this.isLoading.set(false))
			).subscribe({
				next: (response) => {
					if (response) {
						this.router.navigate(['/dashboard']);
					} else {
						this.showAlert(
							response.statusText || 'Error',
							response.message || 'Login failed. Parsing Error.',
							'error'
						);
						this.router.navigate(['/login']);
					}
				},
				error: (err) => {
					this.showAlert(
						err.statusText || 'Error',
						err.error?.message || 'Login failed. Please check your credentials.',
						'error'
					);
				}
			});
		} else {
			this.showAlert(
				'Validation Error',
				'Please fill in all required fields',
				'error'
			);
		}
	}

	private showAlert(title: string, message: string, type: 'error' | 'success') {
		this.alert.open(AlertComponent, {
			data: {
				title,
				message,
				type,
				buttonText: 'OK'
			}
		});
	}
}
