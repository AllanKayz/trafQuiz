import { Component, inject, signal, effect, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TraffiquizService } from '../../traffiquiz.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
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
        MatPaginatorModule,
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
export class UserAccessComponent implements AfterViewInit {
    service = inject(TraffiquizService);
    dialog = inject(MatDialog);
    snackBar = inject(MatSnackBar);

    userDataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor() {
        this.loadUsers();
    }

    ngAfterViewInit() {
        this.userDataSource.paginator = this.paginator;
    }

    loadUsers() {
        this.service.fetchAllUsers().subscribe(data => {
            this.userDataSource.data = data;
            this.userDataSource.paginator = this.paginator;
        });
    }

    openAddUserDialog(template: any) {
        this.dialog.open(template, { width: '400px' });
    }

    openPasswordDialog(user: any, template: any) {
        this.dialog.open(template, { width: '400px', data: user });
    }

    deleteUser(user: any) {
        this.service.showConfirm(`Are you sure you want to delete ${user.name}?`, 'DELETE').subscribe(() => {
            this.service.deleteUser(user.id, user.role).subscribe(() => {
                this.service.showNotification('User deleted', 'success');
                this.loadUsers();
            });
        });
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
