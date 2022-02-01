import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-answer-slide',
  templateUrl: './answer-slide.component.html',
  styleUrls: ['./answer-slide.component.css']
})
export class AnswerSlideComponent implements OnInit {

  @Input() answers: [{value: number, text: string}];
  @Input() numberOfAnswers: number;
  @Output() sendAnswer = new EventEmitter<any>();

  max =  5;
  min = 1;
  maxLabel = "Max";
  minLabel = "Min";
  value = 1;
  showTicks = false;
  step = 1;
  response = {value: 0, text: "", tot: 0};
  touched = false;


  constructor() {}

  ngOnInit() {

    this.max = Math.max.apply(Math, this.answers.map(function(o) { return o.value; }));
    this.min = Math.min.apply(Math, this.answers.map(function(o) { return o.value; }));
    this.value = this.answers.length/2; 
    this.value += 0.5;

    this.answers.forEach(element => {
      if(element.value == this.min){
        if(element.text!=undefined && element.text != ""){
          this.minLabel = element.text;
        }
      } else if(element.value == this.max){
        if(element.text!=undefined && element.text != ""){
          this.maxLabel = element.text;
        }
      }
    });
  }

  callParent() {
    var answerFinal = this.answers.find(d => d.value === this.value);

    if(answerFinal.text != undefined && answerFinal.text != ""){
      this.response.text = answerFinal.text;
    } else{
      this.response.text = this.value+"";
    }
   
    this.response.value = this.value;
    this.response.tot = this.max;
    this.sendAnswer.emit(this.response);
  }

  changedSlide(){
    this.touched = true;
  }
}
