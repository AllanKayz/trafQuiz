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
import { TableColumn, TableComponent } from '../../widgets/table/table.component';
import { SectionheaderComponent } from '../../widgets/sectionheader/sectionheader.component';
import { StatCardComponent } from '../../widgets/stat-card/stat-card.component';
import { MatNativeDateModule } from '@angular/material/core';

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
        TableComponent,
        SectionheaderComponent,
        StatCardComponent,
        MatNativeDateModule
    ],
    templateUrl: './user-access.component.html',
    styleUrl: './user-access.component.css'
})
export class UserAccessComponent {
    service = inject(TraffiquizService);
    dialog = inject(MatDialog);

    users = computed(() => this.service.usersSignal());

    header = 'User Access Management';
    content = 'Manage system users, roles, and security.';

    buttons = computed(() => [
        { name: 'Add User', action: 'addUser', color: 'primary', icon: 'person_add' }
    ]);

    widgets = computed(() => {
        const data = this.users();
        const admins = data.filter(u => u.role === 'admin').length;
        const instructors = data.filter(u => u.role === 'instructor').length;
        const students = data.filter(u => u.role === 'student').length;
        return [
            { title: 'Total Users', data: data.length.toString(), footer: 'Active accounts' },
            { title: 'Instructors', data: instructors.toString(), footer: 'Staff' },
            { title: 'Students', data: students.toString(), footer: 'Enrolled' },
            { title: 'Admins', data: admins.toString(), footer: 'System' }
        ];
    });

    tableColumns = signal<TableColumn[]>([
        { key: 'id', header: 'ID', type: 'number', width: '60px' },
        { key: 'name', header: 'Name', type: 'text' },
        { key: 'email', header: 'Email', type: 'text' },
        { key: 'role', header: 'Role', type: 'status' },
        { key: 'status', header: 'Status', type: 'status' }
    ]);

    tableData = computed(() => this.users());

    constructor() {
        this.loadUsers();
    }

    loadUsers() {
        this.service.fetchAllUsers().subscribe({
            error: (err) => console.error('Failed to load users:', err)
        });
    }

    handleButtonAction(action: string) {
        // Handled by inline click in template for now to maintain template dialog ref
    }

    handleTableAction(event: { action: string, item: any }) {
        if (event.action === 'edit') {
            // Need access to template ref, so we'll handle this in template for now
            // or pass template to handleTableAction. For now, let's keep it simple.
        }
        if (event.action === 'delete') this.deleteUser(event.item);
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
                this.service.showNotification('User created successfully', 'success');
                this.loadUsers();
                dialogRef.close();
            });
        }
    }

    onPasswordChanged(dialogRef: MatDialogRef<any>, userId: string, pass: string) {
        if (pass) {
            this.service.updateUserPassword(userId, pass).subscribe(() => {
                this.service.showNotification('Password updated', 'success');
                dialogRef.close();
            });
        }
    }
}
