import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.css']
})
export class UserViewComponent {
  @Input() data: any;

  users = [];
  selectedQuestions = [];
  selectedUser: any;

  constructor() { }

  ngOnInit(){
    this.prepareUsers();
  }

  ngOnChanges() {
    console.log("onChanges Called");
    this.prepareData();
  }

  prepareUsers() {

    this.users = [];

    for (var i = 0; i < this.data.length; i++) {
      
      var element = this.data[i];
      if(element.session=="" || element.user==""){ continue; }

      var index = this.users.findIndex(usr => usr.session === element.session);
      //if not present, add user-session pair
      if(index == -1){
        console.log("adding user");
        var usr = {
          user: element.user,
          session: element.session
        }
        this.users.push(usr);
      }
    }
    console.log(this.users);
  }

  prepareData(){

    this.selectedQuestions = [];
    if(this.selectedUser == undefined){return;}
    for (var i = 0; i < this.data.length; i++) {
      
      var element = this.data[i];
      if(element.user!=this.selectedUser.user || element.session != this.selectedUser.session){continue;}

      var index = this.selectedQuestions.findIndex(question => question.question == element.question);
      var type = element.questionType;
      console.log(type);
      if(index == -1){
        
        //checkbox case  
        var answer:any = element.txtLabel;
        if(type=="checkbox"){
          answer = [element.txtLabel];
        }

        var qst = {
          type: type,
          question: element.question,
          questionId: element.questionId,
          tag: element.tag,
          label: answer,
          value: element.value
        }
        this.selectedQuestions.push(qst);

      } else if(index != -1 && type=="checkbox"){
        this.selectedQuestions[index].label.push(element.txtLabel);
      } else {
        console.error("error on answer: "+element.txtLabel);
        console.log(this.selectedQuestions[index]);
      }
    }
    console.log(this.selectedQuestions );
    this.selectedQuestions.sort((a, b) => (a.questionId > b.questionId) ? 1 : -1);
  }

}
