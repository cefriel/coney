import { Component } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html'
})

export class ConfirmDialogComponent {

  constructor(private backend: BackendService, public dialogRef: MatDialogRef<ConfirmDialogComponent>) { }

  save() {
    this.dialogRef.close('save');
  }

  discard() {
    this.dialogRef.close('discard');
  }

  close() {
    this.dialogRef.close();
  }
  
}