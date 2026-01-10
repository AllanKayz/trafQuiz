
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
	imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {
	private trafQuizService = inject(TraffiquizService);
	private router = inject(Router);

	/** A signal that indicates whether the login request is in progress. */
	isLoading = signal(false);
	/** A signal that indicates whether the reset password form is shown. */
	showResetForm = signal(false);
	/** A signal that indicates whether the reset token has been received. */
	resetTokenReceived = signal(false);

	/** The form group for the login form. */
	loginForm = new FormGroup({
		username: new FormControl('', Validators.required),
		password: new FormControl('', Validators.required)
	});

	/** The form group for requesting reset. */
	forgotForm = new FormGroup({
		username: new FormControl('', Validators.required)
	});

	/** The form group for setting new password. */
	resetForm = new FormGroup({
		token: new FormControl('', Validators.required),
		newPassword: new FormControl('', [Validators.required, Validators.minLength(6)])
	});

	hide = true;

	constructor() { }

	togglePasswordVisibility() {
		this.hide = !this.hide;
	}

	loadLicence() {

	}

	/**
	 * Toggles the forgot password form.
	 */
	toggleResetForm() {
		this.showResetForm.set(!this.showResetForm());
		this.resetTokenReceived.set(false);
		this.forgotForm.reset();
		this.resetForm.reset();
	}

	/**
	 * Sends a request for a password reset token.
	 */
	sendResetRequest() {
		if (this.forgotForm.valid) {
			this.isLoading.set(true);
			const username = this.forgotForm.get('username')?.value || '';

			this.trafQuizService.forgotPassword(username).pipe(
				finalize(() => this.isLoading.set(false))
			).subscribe({
				next: (res) => {
					this.resetTokenReceived.set(true);
					this.resetForm.patchValue({ token: res.token });
					this.showAlert('Reset token generated (for demo: ' + res.token + '). Please enter your new password.', 'success');
				},
				error: (err) => {
					this.showAlert(err.error?.message || 'User not found', 'error');
				}
			});
		}
	}

	/**
	 * Resets the password using the token and new password.
	 */
	resetPassword() {
		if (this.resetForm.valid) {
			this.isLoading.set(true);
			this.trafQuizService.resetPassword(this.resetForm.value).pipe(
				finalize(() => this.isLoading.set(false))
			).subscribe({
				next: () => {
					this.showAlert('Password updated successfully. You can now log in.', 'success');
					this.toggleResetForm();
				},
				error: (err) => {
					this.showAlert(err.error?.message || 'Could not reset password', 'error');
				}
			});
		}
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
						this.showAlert(response.message || 'Login failed. Parsing Error.', 'error');
						this.router.navigate(['/login']);
					}
				},
				error: (err) => {
					this.showAlert(err.error?.message || 'Login failed. Please check your credentials.', 'error');
				}
			});
		} else {
			this.showAlert('Please fill in all required fields', 'error');
		}
	}

	/**
	 * Displays a snackbar notification with the specified message and type.
	 * @param message The message of the notification.
	 * @param type The type of the notification ('error' or 'success').
	 */
	private showAlert(message: string, type: 'error' | 'success') {
		this.trafQuizService.showNotification(message, type);
	}
}
