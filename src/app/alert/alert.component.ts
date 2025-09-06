import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog'
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-alert',
    imports: [CommonModule, MatButtonModule, MatDialogModule],
    templateUrl: './alert.component.html',
    styleUrl: './alert.component.css'
})
export class AlertComponent {
  alertType: string;

  constructor(public dialogRef: MatDialogRef<AlertComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { 
    this.alertType = data.type || 'error';
	
	// Ensure buttons array exists
	if(!this.data.buttons) {
		this.data.buttons = [{text: data.buttonText || 'OK', value: 'ok'}];
	}
  }

  
  onClose(): void {
    this.dialogRef.close();
  }
  
}