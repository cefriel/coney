import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-answer-checkbox',
  templateUrl: './answer-checkbox.component.html',
  styleUrls: ['./answer-checkbox.component.css']
})
export class AnswerCheckboxComponent implements OnInit {

  @Input() answers: [{ value: number, text: string }];
  @Output() sendAnswer = new EventEmitter<any>();

  values: any;
  valueFormGroup: FormGroup;
  selected: any;
  answerList= [];
  last: any = {};
  disabled = false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
   
    console.log(this.answers);
    for(var i = 0; i<this.answers.length; i++){
      if(this.answers[i].text.substr(0, 4) == "----"){
        this.last = this.answers[i];
      } else {
        this.answerList.push(this.answers[i]);
      }
    }
    if(this.last.text!=undefined){
      this.answerList.push(this.last);
    }
    
    this.valueFormGroup = this.formBuilder.group({
      answerList: this.formBuilder.array([])
    });
  }


  onChange(event, dis) {
    const values = <FormArray>this.valueFormGroup.get('answerList') as FormArray;

    if(dis && !this.disabled){
      this.disabled = true;
    } else {
      this.disabled = false;
    }

    if(event.checked) {   
        values.push(new FormControl(event.source.value))
    } else {
      const i = values.controls.findIndex(x => x.value === event.source.value);
      values.removeAt(i);
    }
    console.log(values);
  }

  callParent() {
    if(this.disabled == true){
      var disabledResult = [this.last];
      this.sendAnswer.emit(disabledResult);
    } else if (this.valueFormGroup.value.answerList.length != 0) {
        this.sendAnswer.emit(this.valueFormGroup.value.answerList);
      }
    
  }

}
