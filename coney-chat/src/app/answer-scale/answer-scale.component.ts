import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-answer-scale',
  templateUrl: './answer-scale.component.html',
  styleUrls: ['./answer-scale.component.css']
})
export class AnswerScaleComponent{

  
  @Input() answers: [{value: number, text: string}];
  @Output() sendAnswer = new EventEmitter<any>();
  
  selected = 0;
  hovered = 0;
  size = 2;
  response = {selected: 0, value: 0, text: "", tot: 0};

  starIcons = {
    empty: 'assets/star_empty.svg',
    half: 'assets/star_half.svg',
    full: 'assets/star_full.svg',
}

  constructor() { 
    this.selected = 0;
    this.hovered = 0;    
  }

  ngOnChanges(){
    if(this.answers.length>7){
      this.size = 1;
    } 
  }

  onRatingSet($event){
    this.selected = $event;
  }

  callParent(value: any) {
    if(this.selected == 0) {return;}
    this.response.selected = this.selected;
    this.response.value = value.value;
    this.response.text = value.text;
    this.response.tot = this.answers.length;
    this.sendAnswer.emit(this.response);
  }

}