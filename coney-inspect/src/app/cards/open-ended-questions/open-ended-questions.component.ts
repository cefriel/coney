import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-open-ended-questions',
  templateUrl: './open-ended-questions.component.html',
  styleUrls: ['./open-ended-questions.component.css']
})
export class OpenEndedQuestionsComponent implements OnInit {

  @Input() data: any;
  
  selectedQuestion: any;
  shownAnswers = [];
  questions= [];
  multipleSameAnswers = false;

  constructor() { }

  ngOnInit() {
    for(var i = 0; i<this.data.length; i++){
      var index = this.questions.findIndex(obj => obj.question == this.data[i].question);
      if(index == -1){
        var obj = {
          question: this.data[i].question,
          tag: this.data[i].tag
        }
        this.questions.push(obj);
      }
    }
  }

  onChange(){
    this.loadAnswers();
  }

  loadAnswers(){
    this.multipleSameAnswers = false;
    this.shownAnswers = [];
    for(var i = 0; i<this.data.length; i++){
      if(this.data[i].question == this.selectedQuestion.question){
        if(this.data[i].count>1){
          this.multipleSameAnswers = true;
        }
        var obj = {
          amount: this.data[i].count,
          answer: this.data[i].answer
        }
        this.shownAnswers.push(obj);
      }
    }
  }

}
