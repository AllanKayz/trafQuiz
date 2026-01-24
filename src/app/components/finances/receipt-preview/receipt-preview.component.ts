import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TraffiquizService } from '../../../../traffiquiz.service';

@Component({
  selector: 'app-receipt-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './receipt-preview.component.html',
  styleUrl: './receipt-preview.component.css'
})
export class ReceiptPreviewComponent {
  service = inject(TraffiquizService);

  constructor(
    public dialogRef: MatDialogRef<ReceiptPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  downloadPdf() {
    this.service.generateReceipt(this.data);
  }

  print() {
    window.print();
  }

  close() {
    this.dialogRef.close();
  }
}
