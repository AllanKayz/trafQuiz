import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TraffiquizService } from '../traffiquiz.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AlertComponent } from '../alert/alert.component';

/**
 * Component responsible for handling user login.
 * This component displays a login form and uses the `TraffiquizService` to authenticate users.
 */
@Component({
	selector: 'app-login',
	imports: [CommonModule, MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {
	private trafQuizService = inject(TraffiquizService);
	private router = inject(Router);
	public alert = inject(MatDialog);

	/** A signal that indicates whether the login request is in progress. */
	isLoading = signal(false);
	/** The form group for the login form. */
	loginForm = new FormGroup({
		username: new FormControl('', Validators.required),
		password: new FormControl('', Validators.required)
	});
	hide = true;

	constructor() { }

	togglePasswordVisibility() {
		this.hide = !this.hide;
	}

	loadLicence() {

	}

	/**
	 * Attempts to log the user in.
	 * If the form is valid, it calls the `login` method of the `TraffiquizService`.
	 * On success, it navigates to the dashboard. On failure, it displays an error message.
	 */
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

	/**
	 * Displays an alert dialog with the specified title, message, and type.
	 * @param title The title of the alert.
	 * @param message The message of the alert.
	 * @param type The type of the alert ('error' or 'success').
	 */
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
