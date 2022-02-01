import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-answer-emoji',
  templateUrl: './answer-emoji.component.html',
  styleUrls: ['./answer-emoji.component.css']
})
export class AnswerEmojiComponent implements OnInit {

  @Input() answers: [{ value: number, text: string }];
  @Input() numberOfAnswers: number;
  @Output() sendAnswer = new EventEmitter<any>();

  text = ["Really bad", "Bad", "Neutral", "Good", "Really good"];
  response = { value: 0, text: "" };
  displayValue = "Select one";

  constructor() { }

  ngOnInit() {
    if (this.answers != undefined) {
      this.answers.forEach(ans => {
        this.text[ans.value - 1] = ans.text;
      });
    }
  }

  emojiSelected(event: MouseEvent, value: any) {

    var items = document.getElementsByClassName("emoji-btn");
    for (var i = 0; i < items.length; i++) {
      var b: any; b = items[i];
      b.style.padding = "0%";
      b.style.fontSize = "35px";
      b.style.marginTop = "5px";
      b.style.marginBottom = "5px";
    }

    var btn: any;
    btn = event.srcElement;
    btn.style.padding = "0% 20%!important";
    btn.style.fontSize = "45px";
    btn.style.marginTop = "-5px";
    btn.style.marginBottom = "0px";

    this.response.value = value;
    this.response.text = this.answers[value - 1].text;
    this.displayValue = this.response.text;
  }

  callParent() {
    if (this.response.value != 0) {
      this.sendAnswer.emit(this.response);
    }
  }

}
