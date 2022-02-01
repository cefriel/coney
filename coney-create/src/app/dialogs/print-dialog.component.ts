import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import printJS from 'print-js'

@Component({
  selector: 'app-print-dialog',
  templateUrl: './print-dialog.component.html'
})

export class PrintDialogComponent {

  res: any;
  title: string;
  questions = [];

  constructor(public dialogRef: MatDialogRef<PrintDialogComponent>, @Inject(MAT_DIALOG_DATA) public data, ) {
    
    this.title = data.title;

    this.questions = JSON.parse(data.questions);

    for (var i = 0; i < this.questions.length; i++) {
      var qElement = this.questions[i];
     
      for (var j = 0; j < qElement.answers.length; j++) {
        var aElement = qElement.answers[j];
        var questionReteId = aElement.nextQuestionId;
        var index = this.questions.findIndex(obj => obj.id == questionReteId);
        if (index != -1 && questionReteId != 0) {
          this.questions[i].answers[j].nextQuestionId = this.questions[index].order;
        }
      }

      var answersTmp = qElement.answers.sort((a, b) => (a.order > b.order) ? 1 : -1);
      this.questions[i].answers = answersTmp;
    }
  }

  save() {


  }

  print(){
    let printContents, popupWin;
    printContents = document.getElementById('toPrint').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
          //........Customized style.......
          </style>
        </head>
    <body onload="window.print();window.close()">${printContents}</body>
      </html>`
    );
    popupWin.document.close();
  }

  printTest() {
    printJS({
      printable: "toPrint",
      type: "html",
      style: "",
      css: ['src/styles.css', 'src/app/home.component.css']
    });
  }

  discard() {
    this.dialogRef.close('discard');
  }

  close() {
    this.dialogRef.close();
  }

}
