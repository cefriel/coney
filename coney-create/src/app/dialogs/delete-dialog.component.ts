import { Component, Inject } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html'
})

export class DeleteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private backend: BackendService,
    public dialogRef: MatDialogRef<DeleteDialogComponent>,
    private router: Router) { }

  delete() {
    let endpoint = '/create/deleteConversation?';
    endpoint = endpoint + 'conversationId=' + this.data.conversationId;
    endpoint = endpoint + '&status=' + this.data.status;

    this.backend.deleteObject(endpoint).subscribe(res => {
      this.dialogRef.close('deleted');
    });
  }

  close() {
    this.dialogRef.close();
  }

}