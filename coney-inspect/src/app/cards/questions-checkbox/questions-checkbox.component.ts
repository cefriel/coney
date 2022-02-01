import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-questions-checkbox',
  templateUrl: './questions-checkbox.component.html',
  styleUrls: ['./questions-checkbox.component.css']
})
export class QuestionsCheckboxComponent implements OnInit {

  @Input() data: any;
  @Input() currentTag: any;
  @Output() selectedQs = new EventEmitter< any >();;

  questionFormGroup: FormGroup;
  questionsList: string[] = [];

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.questionsList = [];
    for (var i = 0; i < this.data.length; i++) {
      this.questionsList.push(this.data[i].question);
    }

    this.questionFormGroup = this.formBuilder.group({
      questionsList: this.formBuilder.array([])
    });
  }

  ngOnChanges(){
    this.questionsList = [];
    if(this.currentTag == ""){

      for (var i = 0; i < this.data.length; i++) {
        this.questionsList.push(this.data[i].question);
      }

    } else {
      
      for (var i = 0; i < this.data.length; i++) {
        if(this.data[i].tag == this.currentTag) {
          this.questionsList.push(this.data[i].question);
        }
      }
    }
    if(this.questionFormGroup != undefined){
      const questions = <FormArray>this.questionFormGroup.get('questionsList') as FormArray;
      questions.clear();
    }
  }

  onChange(event) {
    
    const questions = <FormArray>this.questionFormGroup.get('questionsList') as FormArray;

    if (event.checked) {
      questions.push(new FormControl(event.source.value))
    } else {
      const i = questions.controls.findIndex(x => x.value === event.source.value);
      questions.removeAt(i);
    }

    this.selectedQs.emit(this.questionFormGroup.value.questionsList)
  }

  ngAfterViewInit() {
  }
}