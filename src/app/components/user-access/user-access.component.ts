import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraffiquizService } from '../../traffiquiz.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-user-access',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        MatInputModule,
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule
    ],
    templateUrl: './user-access.component.html',
    styleUrl: './user-access.component.css'
})
export class UserAccessComponent {
    service = inject(TraffiquizService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);

    users = signal<any[]>([]);
    displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];

    constructor() {
        this.loadUsers();
    }

    loadUsers() {
        this.service.fetchAllUsers().subscribe(data => {
            this.users.set(data);
        });
    }

    openAddUserDialog(template: any) {
        this.dialog.open(template, { width: '400px' });
    }

    openPasswordDialog(user: any, template: any) {
        this.dialog.open(template, { width: '400px', data: user });
    }

    deleteUser(user: any) {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            this.service.deleteUser(user.id, user.role).subscribe(() => {
                this.snackBar.open('User deleted', 'Close', { duration: 3000 });
                this.loadUsers();
            });
        }
    }

    onUserAdded(dialogRef: MatDialogRef<any>, form: any) {
        if (form.valid) {
            const newUser = form.value;
            this.service.addUser(newUser).subscribe(() => {
                this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
                this.loadUsers();
                dialogRef.close();
            });
        }
    }

    onPasswordChanged(dialogRef: MatDialogRef<any>, userId: string, pass: string) {
        if (pass) {
            this.service.updateUserPassword(userId, pass).subscribe(() => {
                this.snackBar.open('Password updated', 'Close', { duration: 3000 });
                dialogRef.close();
            });
        }
    }
}
