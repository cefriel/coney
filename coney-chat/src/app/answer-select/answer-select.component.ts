import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-answer-select',
  templateUrl: './answer-select.component.html',
  styleUrls: ['./answer-select.component.css']
})
export class AnswerSelectComponent implements OnInit {

  @Input() answers: [{ value: number, text: string }];
  @Input() numberOfAnswers: number;
  @Output() sendAnswer = new EventEmitter<any>();

  response = { value: 0, text: "" };

  constructor() { }

  ngOnInit() {
   
  }

  callParent() {

    if (!(this.response.text == "" && this.response.value== 0)) {
    this.sendAnswer.emit(this.response);
    }
  }

}
