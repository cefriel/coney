import { Component } from '@angular/core';
import { BackendService } from '../services/backend.service';
import { MatDialogRef } from '@angular/material';
import { ENUM_CONV_STATUS } from '../model/conversational.model';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-search-conv-dialog',
  templateUrl: './search-conv-dialog.component.html'
})

export class SearchConvDialogComponent {

  titleValue = '';

  selectedStatus = "all";
  selectedProject = "all";

  projects = ["all"];
  chats = [];
  noTitleChats = [];
  statuses = ["all", "saved", "published", "unpublished"];
  initialChats = [];
  chatsFound = true;
  isLoading = false;
  showProject = environment.enterprise;

  constructor(private backend: BackendService, public dialogRef: MatDialogRef<SearchConvDialogComponent>) {
    this.isLoading = true;
    this.startSearch();
  }


  selectionChanged(){

    if (this.selectedProject !== undefined && this.selectedProject !== "" && this.selectedProject!== 'all') {
      this.noTitleChats = this.initialChats.filter(x => x.projectName.toLowerCase() == this.selectedProject.toLowerCase());
    } else {
      this.noTitleChats = this.initialChats;
    }

    if (this.selectedStatus !== undefined && this.selectedStatus !== "" && this.selectedStatus!== 'all') {
      this.noTitleChats = this.noTitleChats.filter(x => x.status.toLowerCase() == this.selectedStatus.toLowerCase());
    } 

    this.chats = this.noTitleChats;
    this.titleSelectionChanged();
    
  }

  titleSelectionChanged() {
    if (this.titleValue !== "") {
      this.chats = this.noTitleChats.filter(x => x.conversationTitle.toLowerCase().includes(this.titleValue.toLowerCase()));
    } else {
      this.chats = this.noTitleChats;
    }
  }

  startSearch() {
    let endpoint = '/create/searchConversation?';

    this.backend.getRequest(endpoint).subscribe(json => {
      
      this.isLoading = false;
      this.chats = JSON.parse(json);
      this.chats.sort(function(a, b) {
        return a.conversationTitle.toLowerCase().localeCompare(b.conversationTitle.toLowerCase());
      });

      if (this.chats.length > 0) {
        this.chatsFound = true;
        this.initialChats = this.chats;
        this.noTitleChats = this.chats;
        if(this.showProject){
          this.getProjects();
        }
      } else {
        this.chatsFound = false;
      }
    });
  }

  getProjects(){
    for(var i = 0; i<this.chats.length; i++){
      var pr = this.chats[i].projectName;
      if(!this.projects.includes(pr)){
        this.projects.push(pr);
      }
    }
  }

  chatSelected(chat: JSON) {
    this.dialogRef.close(chat);
  }
}
