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
import { AlertComponent } from '../../alert/alert.component';

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
            const newUser = { ...form.value };
            let generatedUsername = '';
            let generatedPassword = '';

            // Auto-generate username if not provided
            if (!newUser.username && newUser.email) {
                generatedUsername = newUser.email.split('@')[0];
                newUser.username = generatedUsername;
            }

            // Auto-generate password if not provided
            if (!newUser.password) {
                generatedPassword = this.generatePassword();
                newUser.password = generatedPassword;
            }

            this.service.addUser(newUser).subscribe({
                next: () => {
                    const roleLabel = newUser.role === 'admin' ? 'Administrator' :
                        newUser.role === 'instructor' ? 'Instructor' : 'Student';

                    // If credentials were generated, show them to the admin
                    if (generatedUsername || generatedPassword) {
                        this.showCredentialsDialog(
                            newUser.username,
                            generatedPassword || newUser.password,
                            newUser.email,
                            roleLabel
                        );
                    } else {
                        this.service.showNotification(`${roleLabel} created successfully`, 'success');
                    }

                    this.loadUsers();
                    dialogRef.close();
                },
                error: (err) => {
                    this.service.showNotification(`Failed to create user: ${err.message || 'Unknown error'}`, 'error');
                }
            });
        }
    }

    private generatePassword(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    private showCredentialsDialog(username: string, password: string, email: string, role: string) {
        const credentials = `Username: ${username}\nPassword: ${password}\nEmail: ${email}`;

        const dialogRef = this.service.alert.open(AlertComponent, {
            width: '450px',
            data: {
                title: `${role} Created Successfully`,
                message: `Login credentials have been generated:\n\nUsername: ${username}\nPassword: ${password}\nEmail: ${email}\n\nPlease save these credentials securely and share them with the user.`,
                type: 'success',
                buttons: [
                    { text: 'Copy Credentials', value: 'copy', color: 'primary' },
                    { text: 'Done', value: 'done', color: 'primary' }
                ]
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result === 'copy') {
                this.copyToClipboard(credentials);
                this.service.showNotification('Credentials copied to clipboard', 'success');
            }
        });
    }

    private copyToClipboard(text: string): void {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(err => {
                console.error('Failed to copy to clipboard:', err);
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    private fallbackCopy(text: string): void {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        document.body.removeChild(textarea);
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
