import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-add-quick-question-dialog',
  templateUrl: './add-quick-question-dialog.component.html'
})

export class AddQuickQuestionDialogComponent {

  pickedType: string;
  types: string[] = ['Open-ended', 'Multiple choice', 'Checkboxes'];
  public answersAmount = 1;
  public content = "";
  radioText = true;

  constructor(public dialogRef: MatDialogRef<AddQuickQuestionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data, ) {
    
  }

  save() {

    if (this.pickedType != "Multiple choice") {
      this.answersAmount = 1;
      this.content = "";
    }

    var result = { type: "", num: 0, content: "" };
    result.content = this.content;
    result.num = this.answersAmount;

    if(this.pickedType=="Checkboxes"){
      result.type = "checkbox";
    } else if(this.pickedType == "Open-ended"){
      result.type = "single";
    } else {
      result.type = "multiple";
    }
    this.dialogRef.close(result);
  }

  discard() {
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}
