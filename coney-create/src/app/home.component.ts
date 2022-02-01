import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { BackendService } from './services/backend.service';
import { SearchConvDialogComponent } from './dialogs/search-conv-dialog.component';
import { SaveAsDialogComponent } from './dialogs/save-as-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import { PublishDialogComponent } from './dialogs/publish-dialog.component';
import { AddQuickQuestionDialogComponent } from './dialogs/add-quick-question-dialog.component';
import { PrintDialogComponent } from './dialogs/print-dialog.component';

import { ENUM_CHAT, ENUM_CONV_STATUS, ENUM_ERROR, RETE_ID, ENUM_OPERATION_FEEDBACK, ENUM_WARNING, ENUM_SUCCESS, ENUM_NODE_COMPONENT } from './model/conversational.model';
import { Chat } from './model/chat';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { ReteComponent } from './rete/rete.component';


import * as CryptoJS from 'crypto-js';
import { environment } from '../environments/environment';
import { AuthenticationService } from './services/authentication.service';
import { TranslationDialogComponent } from './dialogs/translation-dialog.component';
import { ShareSurveyDialogComponent } from './dialogs/share-survey-dialog.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {
  @ViewChild(ReteComponent, { static: false })
  private reteComp: ReteComponent;

  editorJson: JSON;
  editedJson: JSON;
  newNodeJson: JSON;

  newButtonEnabled = true;
  saveButtonEnabled = true;
  saveAsButtonEnabled = true;
  previewButtonEnabled = true;
  publishButtonEnabled = true;
  unpublishButtonEnabled = true;
  deleteButtonEnabled = true;

  loadingInProgress = false;
  showHelp = false;
  enterprise = true;
  showingMap = true;

  titleEditable = true;

  currentConversationId = '';
  currentConversationStatus = '';
  currentConversationProject = '';
  currentConversationTitle = '';
  currentConversationLanguage = '';
  currentAccessLevel;

  position_x = 80;
  position_y = 200;
  conversationTags = [];

  genericLink = "";

  node = { id: 0, type: "", subtype: "", text: "", link: "", value: 0, points: 0, image_url: "" };
  pendingModificationsToSave = false;

  constructor(private backend: BackendService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private route: ActivatedRoute, 
    private router: Router) { }

  //prevents page unload if there are changes to be saves
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.pendingModificationsToSave) {
      if(!this.reteComp.isConversationNew()){
      $event.returnValue = true;
      }
    }
  }

  ngOnInit() {
    this.enterprise = environment.enterprise;
    this.currentConversationTitle = '';
    this.currentConversationProject = '';
    this.currentConversationStatus = '';
    this.currentConversationId = '';
    this.updateButtons();

    if(sessionStorage.getItem("conv") != null 
      && sessionStorage.getItem("conv") != ""
      && sessionStorage.getItem("conv") != "null"){
        
      console.log("entered session storage");
      console.log( sessionStorage.getItem("conv"));
      var tmp = {conversationId : sessionStorage.getItem("conv")};
      this.openConversation(tmp);
    } else {
      this.route.queryParams.forEach((params: Params) => {
        if(params["data"]!= undefined && params["data"]!= null && params["data"] != ""){
          console.log("entered data param");
          console.log(params["data"]);
          var tmp = {conversationId : params["data"]};
          this.openConversation(tmp);
          this.getConversationProject(params["data"]);
        }
      });
    }
    this.pendingModificationsToSave = false;
  }

  newButtonPressed() {
    if (this.pendingModificationsToSave && !this.reteComp.isConversationNew()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '300px',
        height: '415px',
      });

      dialogRef.afterClosed().subscribe(status => {
        if (status !== undefined) {
          if (status === 'save') {
            if (this.currentConversationTitle === '') {
              this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.MISSING_TITLE);
            } else {
              this.saveConversation();
              this.openNewConversation();
            }
          } else if (status === 'discard') {
            this.openNewConversation();
          }
        }
      });
    } else {
      this.openNewConversation();
    }
  }

  async openNewConversation() {

    const firstNode = '{"1": {"id": "1", "name": "Talk [text]","data": {"text": null, "tag":[], "value": null},"inputs": [{"connections": []}], "outputs": [{"connections": []}], "position":[300,250]}}';
    const newChat = <Chat>{};
    newChat.conversationId = '';
    newChat.status = '';
    newChat.id = RETE_ID;
    newChat.title = '';
    newChat.nodes = JSON.parse(firstNode);

    this.currentConversationId = '';
    this.currentConversationStatus = '';
    this.currentConversationTitle = '';
    this.currentConversationProject = '';
    this.currentAccessLevel = undefined;
    this.currentConversationLanguage = '';
    this.editorJson = JSON.parse(JSON.stringify(newChat));
    this.node.id = 1;

    sessionStorage.setItem("conv", null);
    this.router.navigate([''], { queryParams: { data: ""} });
    this.updateButtons();

  }

  async toggleMapButtonPressed() {

    var map;
    var docs = document.getElementsByClassName("minimap");
    var resetBtn = document.getElementById("resetBtn");
    map = docs[0];
    if (this.showingMap) {
      this.showingMap = false;
      map.style.display = "none";
      resetBtn.style.bottom = "24px";
    } else {
      resetBtn.style.bottom = "180px";
      await this.reteComp.delay(300);
      map.style.display = "block";
      this.showingMap = true;
    }
  }

  helpButtonPressed(cas: string) {
    if (this.showHelp) {
      this.showHelp = false;
    } else {
      if (cas == 'btn') {
        this.showHelp = true;
      }
    }
  }

  saveButtonPressed() {
    if (environment.enterprise && (this.currentConversationTitle === '' || this.currentAccessLevel == undefined || this.currentConversationProject == "")) {
      this.saveAsButtonPressed();
    } else if(!environment.enterprise && (this.currentConversationTitle === '' || this.currentConversationLanguage === '')){
      this.saveAsButtonPressed();
    } else {
      this.saveConversation();
    }
  }

  saveConversation() {
    this.editedJson[ENUM_CHAT.CONV_ID] = this.currentConversationId;
    this.editedJson[ENUM_CHAT.STATUS] = this.currentConversationStatus;
    this.editedJson[ENUM_CHAT.TITLE] = this.currentConversationTitle;
    this.editedJson[ENUM_CHAT.PROJECT] = this.currentConversationProject;
    this.editedJson[ENUM_CHAT.ACCESS_LEVEL] = this.currentAccessLevel;
    this.editedJson[ENUM_CHAT.LANGUAGE] = this.currentConversationLanguage;

    this.reteComp.getConversationTags();
    this.uploadTags();

    this.backend.postJson('/create/saveConversation', this.editedJson).subscribe(res => {
      this.currentConversationId = res[ENUM_CHAT.CONV_ID];
      this.currentConversationStatus = res[ENUM_CHAT.STATUS];
      this.pendingModificationsToSave = false;

      this.updateButtons();

      this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.SUCCESS, ENUM_SUCCESS.SAVED);

    }, err => {
      if (err.status === 409) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.ERROR, ENUM_ERROR.RES_409);
      } else {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.ERROR, ENUM_ERROR.GENERIC);
      }

    });
  }

  uploadTags(){

    if(this.conversationTags.length < 1){
      return;
    }

    var js = "{\"tags\":[";
    var mid = "";
    for(var i = 0; i<this.conversationTags.length; i++){
      if(mid == ""){
        mid += "\""+this.conversationTags[i]+"\"";
      } else {
        mid += ",\""+this.conversationTags[i]+"\"";
      }
    } 
    js = js + mid + "]}";

    var jsonToSend = JSON.parse(JSON.stringify(js));

    this.backend.postJson('/create/uploadTags',jsonToSend).subscribe(res => {
    });

  }

  async toggleHidden() {
    var el = document.getElementById("publish-hidden-commands");
    var content = document.getElementById("hidden-content");

    if (el.style.height == "0px") {
      el.style.height = "200px";
      el.style.visibility = "visible";
      await this.delay(150);
      content.style.visibility = "visible";
    } else {
      el.style.height = "0px";
      el.style.visibility = "hidden";
      content.style.visibility = "hidden";
    }
  }

  saveAsButtonPressed() {
    
    const dialogRef = this.dialog.open(SaveAsDialogComponent, {
      width: '400px',
      height: '550px',
      data: {
        title: this.currentConversationTitle,
        role: this.currentConversationProject
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res !== undefined) {

        var title = res.title;

        if(environment.enterprise){
          this.currentConversationProject = res.projectName;
          this.currentAccessLevel = res.accessLevel;
          this.editedJson[ENUM_CHAT.PROJECT] = this.currentConversationProject;
          this.editedJson[ENUM_CHAT.ACCESS_LEVEL] = res.accessLevel;
        }
        
        this.currentConversationLanguage = res.lang;

        if (res.overwrite) {
          this.saveConversation();
          return;
        }
        this.editedJson[ENUM_CHAT.CONV_ID] = '';
        this.editedJson[ENUM_CHAT.STATUS] = '';
        this.editedJson[ENUM_CHAT.TITLE] = title;
        this.editedJson[ENUM_CHAT.LANGUAGE] = res.lang;

        this.backend.postJson('/create/saveConversation', this.editedJson).subscribe(
          res => {
            this.currentConversationId = res[ENUM_CHAT.CONV_ID];
            this.currentConversationStatus = res[ENUM_CHAT.STATUS];
            this.currentConversationLanguage = res[ENUM_CHAT.LANGUAGE];

            if(environment.enterprise){
              this.currentConversationProject = res[ENUM_CHAT.PROJECT];
              this.currentAccessLevel = res[ENUM_CHAT.ACCESS_LEVEL];
            }
            
            this.currentConversationTitle = title;

            this.editorJson = this.editedJson;
            this.updateButtons();

            this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.SUCCESS, ENUM_SUCCESS.SAVED);

          }, err => {
            if (err.status === 409) {
              this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_ERROR.RES_409);
            } else {
              this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.ERROR, ENUM_ERROR.GENERIC);
            }
          
          }
        );
      }
    });
  }

  previewButtonPressed() {

    this.loadingInProgress = true;
    this.previewButtonEnabled = false;

    if (this.currentConversationId === null || this.currentConversationId === "") {
      this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, "Save Conversation first");
      this.loadingInProgress = false;
      return;
    }

    if (!this.manualCheckButtonPressed()) {
      this.loadingInProgress = false;
      return;
    }


    this.editedJson[ENUM_CHAT.CONV_ID] = this.currentConversationId;
    this.editedJson[ENUM_CHAT.STATUS] = this.currentConversationStatus;
    this.editedJson[ENUM_CHAT.TITLE] = this.currentConversationTitle;
    this.editedJson[ENUM_CHAT.PROJECT] = this.currentConversationProject;
    this.editedJson[ENUM_CHAT.ACCESS_LEVEL] = this.currentAccessLevel;

    this.backend.postJson('/create/previewConversation', this.editedJson).subscribe(res => {
      if (res["success"] == true) {

        this.loadingInProgress = false;
        var url = this.generateGenericLink("preview");
        window.open(url, "newwindow", "width=350,height=600");

      } else {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.ERROR, "Something went wrong :(");
      }
      this.loadingInProgress = false;
      this.previewButtonEnabled = true;
    }, err => {
      this.loadingInProgress = false;
    });
  }

  manualCheckButtonPressed() {
    var n: any; var array = [];

    n = this.reteComp.checkForMistakes();
    if (n == 0 || n == 1 || n == 2 || n == 3 || n == 4) {
      if (n == 0) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.NO_STARTS);
      } else if (n == 1) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.ISOLATED_NODE);
      } else if (n == 2) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.MULTIPLE_STARTS);
      } else if (n == 3) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.QUESTION_END);
      } else if (n == 4) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.FIELD_MISSING);
      }

    } /*else if (!this.reteComp.checkForLoops(n, array)) {  //TOO HEAVY WITH LONG CONVERSATIONS
      this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.LOOPS);
    } */else {

      var x = this.reteComp.checkForMultipleValues(n);
      this.reteComp.globalPath = [];
      if (x == 1) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.SAME_VALUE);
        return false;
      } else if (x == 2) {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.NO_TEXT);
        return false;
      } else {
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.SUCCESS, ENUM_WARNING.NO_ERRORS);
        return true;
      }

    }

    if (this.currentConversationTitle === '') {
      this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.MISSING_TITLE);
      return false;
    }
  }

  publishButtonPressed() {
    
    if (!this.manualCheckButtonPressed()) {
    } else {
      this.loadingInProgress = true;
      this.editedJson[ENUM_CHAT.CONV_ID] = this.currentConversationId;
      this.editedJson[ENUM_CHAT.STATUS] = this.currentConversationStatus;
      this.editedJson[ENUM_CHAT.PROJECT] = this.currentConversationProject;
      this.editedJson[ENUM_CHAT.TITLE] = this.currentConversationTitle;

      const dialogRef = this.dialog.open(PublishDialogComponent, {
        width: '300px',
        height: '350px',
        data: {
          conversation: this.editedJson
        }
      });

      dialogRef.afterClosed().subscribe(res => {
        this.loadingInProgress = false;
        if (res !== undefined && res != 0) {
          if (res === 409) {
            this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.ERROR, ENUM_ERROR.RES_409);
          } else {
            this.currentConversationId = res[ENUM_CHAT.CONV_ID];
            this.currentConversationStatus = res[ENUM_CHAT.STATUS];
            this.currentConversationTitle = res[ENUM_CHAT.TITLE];

            this.editedJson[ENUM_CHAT.CONV_ID] = this.currentConversationId;
            this.editedJson[ENUM_CHAT.STATUS] = this.currentConversationStatus;
            this.editedJson[ENUM_CHAT.PROJECT] = this.currentConversationProject;
            this.editedJson[ENUM_CHAT.TITLE] = this.currentConversationTitle;
            this.editorJson = this.editedJson;

            this.pendingModificationsToSave = false;

            this.updateButtons();

            this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.SUCCESS, ENUM_SUCCESS.PUBLISHED);
          }
        } else {
          this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.ERROR, ENUM_ERROR.GENERIC);
          this.loadingInProgress = false;
        }
      });
    }
  }

  unpublishButtonPressed() {
    let endpoint = '/create/unpublishConversation';
    endpoint = endpoint + '?conversationId=' + this.currentConversationId;

    this.backend.getRequest(endpoint).subscribe(
      res => {

        if (res) {
          this.currentConversationStatus = ENUM_CONV_STATUS.UNPUBLISHED;
        }

        this.updateButtons();
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.SUCCESS, ENUM_SUCCESS.UNPUBLISHED);
      }
    );
  }

  deleteButtonPressed() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '300px',
      height: '300px',
      data: {
        conversationId: this.currentConversationId,
        status: this.currentConversationStatus
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res !== undefined) {
        if (res === 'deleted') {
          const firstNode = '{"1":{"id":1,"data":{"text":""},"inputs":{"in":{"connections":[]}},"outputs":{"out":{"connections":[]}},"position":[80,200],"name":"Talk [text]"}}';

          const newChat = <Chat>{};
          newChat.conversationId = '';
          newChat.status = '';
          newChat.id = RETE_ID;
          newChat.title = '';
          newChat.projectName = '';
          newChat.nodes = JSON.parse(firstNode);

          this.currentConversationTitle = '';
          this.currentConversationProject = '';
          this.currentConversationStatus = '';
          this.currentConversationId = '';
          this.currentConversationLanguage = '';
          this.currentAccessLevel = undefined;

          this.editorJson = JSON.parse(JSON.stringify(newChat));

          this.updateButtons();

          this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.SUCCESS, ENUM_SUCCESS.DELETED);
        } else {
          this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.ERROR, ENUM_ERROR.NOT_DELETED);
        }
      }
    });
  }

  searchButtonPressed() {
    const dialogRef = this.dialog.open(SearchConvDialogComponent, {
      width: '700px',
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(selectedChat => {
      if (selectedChat !== undefined) {
        if (this.pendingModificationsToSave && !this.reteComp.isConversationNew()) {
          const dialog = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            height: '415px',
          });

          dialog.afterClosed().subscribe(status => {
            if (status !== undefined) {
              if (status === 'save') {
                if (this.currentConversationTitle === '') {
                  this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.WARNING, ENUM_WARNING.MISSING_TITLE);
                } else {
                  this.saveConversation();
                  
                  this.openConversation(selectedChat);
                }
              } else if (status === 'discard') {
                this.currentConversationProject = selectedChat.projectName;
                this.currentAccessLevel = selectedChat.accessLevel;
                this.openConversation(selectedChat);
              }
            }
          });
        } else {
          this.currentConversationProject = selectedChat.projectName;
          this.currentAccessLevel = selectedChat.accessLevel;
          this.openConversation(selectedChat);
        }
      }
    });
    
  }

  translationDialogButtonPressed(){
    //TODO

    const dialogRef = this.dialog.open(TranslationDialogComponent, {
      width: '500px',
      maxHeight: '600px',
      data: {
        conversationId: this.currentConversationId,
        conversationTitle: this.currentConversationTitle
      }
    });

    dialogRef.afterClosed().subscribe(res => {
      if(res=="translation_uploaded"){
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.SUCCESS, "Translation successfully uploaded");
      }
    });


  }

  addQuestionButtonPressed() {

    const dialogRef = this.dialog.open(AddQuickQuestionDialogComponent, {
      width: '600px',
      height: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(toAdd => {
      if (toAdd != undefined) {
        this.reteComp.addBlankQuestion(this.position_x + 300, this.position_y, toAdd.type, toAdd.num, toAdd.content);
        this.updateButtons();
      }
    });
  }

  addQuickTalk() {
    this.reteComp.addEmptyTalk(this.position_x + 300, this.position_y)
  }

  getConversationProject(conversationId){
    let endpoint = '/create/getConversationProject';
    endpoint = endpoint + '?conversationId=' + conversationId;
    this.backend.getRequest(endpoint).subscribe(res => {
      this.currentConversationProject = res.toString();
    });
  }

  openConversation(selectedChat) {
    this.loadingInProgress = true;


    let endpoint = '/create/getConversationJson';
    endpoint = endpoint + '?conversationId=' + selectedChat.conversationId;
    this.backend.getRequest(endpoint).subscribe(res => {
      
      if(res == null || JSON.stringify(res) == ""){
        this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.INFO, "Failed to open the file");
        this.loadingInProgress = false;
        return;
      }

      const json = JSON.parse(res);

      this.currentConversationId = json[ENUM_CHAT.CONV_ID];
      this.currentConversationStatus = json[ENUM_CHAT.STATUS];
      this.currentConversationTitle = json[ENUM_CHAT.TITLE];
      this.currentConversationProject = json[ENUM_CHAT.PROJECT];
      this.currentAccessLevel = json[ENUM_CHAT.ACCESS_LEVEL];
      this.currentConversationLanguage = json[ENUM_CHAT.LANGUAGE];

      this.editorJson = json;

      this.updateButtons();
      

      sessionStorage.setItem("conv", this.currentConversationId);
      this.router.navigate([''], { queryParams: { data: selectedChat.conversationId} });

      this.delay(500);
      this.reteComp.resetView();
      this.getConversationTags();
      this.loadingInProgress = false;
    }, err => {
      this.loadingInProgress = false;
      this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.INFO, ENUM_ERROR.GENERIC);
    });

  }

  userLogout(){
    this.router.navigate(['logout']);
  }

  delay(time: any) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async getConversationTags() {
    await this.delay(1000);
    this.reteComp.getConversationTags();
  }

  reteChangedConversationTags(tags) {
    this.conversationTags = tags;
  }

  removeTagFilter() {
    this.reteComp.highlightTags("@#[");
    document.getElementById("noTagBtn").innerHTML = "No tag selected";
    document.getElementById("noTagBtn").classList.remove("col-9");
    document.getElementById("noTagBtn").classList.add("col-12");
    document.getElementById("removeTagFilterBtn").style.display = "none";
  }


  highlightTags(tag) {
    this.reteComp.highlightTags(tag);
  }

  updateButtons() {
    // unsaved
    if (this.currentConversationStatus === '') {
      this.newButtonEnabled = true;
      this.saveButtonEnabled = true;
      this.saveAsButtonEnabled = true;
      this.publishButtonEnabled = false;
      this.unpublishButtonEnabled = false;
      this.deleteButtonEnabled = false;
      this.previewButtonEnabled = false;

      this.titleEditable = true;
    }

    // saved
    if (this.currentConversationStatus === ENUM_CONV_STATUS.SAVED) {
      this.newButtonEnabled = true;
      this.saveButtonEnabled = true;
      this.saveAsButtonEnabled = true;
      this.publishButtonEnabled = true;
      this.unpublishButtonEnabled = false;
      this.deleteButtonEnabled = true;
      this.previewButtonEnabled = true;

      this.titleEditable = true;
    }

    // published
    if (this.currentConversationStatus === ENUM_CONV_STATUS.PUBLISHED) {
      this.newButtonEnabled = true;
      this.saveButtonEnabled = false;
      this.saveAsButtonEnabled = true;
      this.publishButtonEnabled = false;
      this.unpublishButtonEnabled = true;
      this.deleteButtonEnabled = false;
      this.previewButtonEnabled = true;

      this.titleEditable = false;
    }

    // unpublished
    if (this.currentConversationStatus === ENUM_CONV_STATUS.UNPUBLISHED) {
      this.newButtonEnabled = true;
      this.saveButtonEnabled = false;
      this.saveAsButtonEnabled = true;
      this.publishButtonEnabled = true;
      this.unpublishButtonEnabled = false;
      this.deleteButtonEnabled = true;
      this.previewButtonEnabled = true;

      this.titleEditable = true;
    }
  }

  reteChangedPosition(pos: Array<number>) {
    this.position_x = pos[0];
    this.position_y = pos[1];
  }

  reteEditedJson(json: JSON) {
    if (this.currentConversationStatus === ENUM_CONV_STATUS.SAVED || this.currentConversationStatus === '') {
      this.pendingModificationsToSave = true;
    } else {
      this.pendingModificationsToSave = false;
    }
    this.editedJson = json;
  }

  reteMessage(obj: Object) {
    this.operationFeedbackMessage(obj['type'], obj['msg']);
  }

  keyPressed($event) {
    var focus = this.reteComp.checkForInputFocus();
    if (navigator.platform.match('Mac')) {
      this.handleMacKeyEvents($event, focus);
    }
    else {
      this.handleWindowsKeyEvents($event, focus);
    }
  }

  // if (!this.reteComp.checkForInputFocus()) {}
  handleMacKeyEvents($event, focus) {
    let charCode = String.fromCharCode($event.which).toLowerCase();

    if ($event.metaKey && (charCode === 'l' || charCode === 'z' || charCode === 'y' || charCode === ' ' || charCode === 's' || charCode === 'm' || charCode === 'o' || charCode === 'p' || charCode === 'q' || charCode === 'e')) {
      $event.preventDefault();
    }

    let charKeyCode = $event.key.toLowerCase();
    var arr = [];

    if($event.metaKey && charKeyCode == 'arrowleft') {

      this.reteComp.moveAllFollowingNodes(undefined, arr, "left");

    } else if($event.metaKey && charKeyCode == 'arrowright') {

      this.reteComp.moveAllFollowingNodes(undefined, arr, "right");

    } else if($event.metaKey && charKeyCode == 'arrowup') {

      this.reteComp.moveAllFollowingNodes(undefined, arr, "up");

    } else if($event.metaKey && charKeyCode == 'arrowdown'){

      this.reteComp.moveAllFollowingNodes(undefined, arr, "down");

    } else if ($event.metaKey) {
      this.performActionOnKeydown(charCode);
    }
  }

  handleWindowsKeyEvents($event, focus) {
    let charCode = String.fromCharCode($event.which).toLowerCase();

    if ($event.ctrlKey && (charCode === 'l' || charCode === 'z' || charCode === 'y' || charCode === ' ' || charCode === 's' || charCode === 'm' || charCode === 'o' || charCode === 'p' || charCode === 'q' || charCode === 'e')) {
      $event.preventDefault();
    }

    let charKeyCode = $event.key.toLowerCase();
    var arr = [];
    if($event.ctrlKey && charKeyCode == 'arrowleft') {

      this.reteComp.moveAllFollowingNodes(undefined, arr, "left");

    } else if($event.ctrlKey && charKeyCode == 'arrowright') {

      this.reteComp.moveAllFollowingNodes(undefined, arr, "right");

    } else if($event.ctrlKey && charKeyCode == 'arrowup') {

      this.reteComp.moveAllFollowingNodes(undefined, arr, "up");

    } else if($event.ctrlKey && charKeyCode == 'arrowdown'){

      this.reteComp.moveAllFollowingNodes(undefined, arr, "down");

    } else if ($event.ctrlKey) {
      this.performActionOnKeydown(charCode);
    }
  }

  performActionOnKeydown(charCode) {
    if (charCode === 's') {
      this.saveButtonPressed();
    } else if (charCode === 'm') {
      this.newButtonPressed();
    } else if (charCode === 'p') {
      this.previewButtonPressed();
    } else if (charCode === 'o') {
      this.searchButtonPressed();
    } else if (charCode === 'e') {
      this.addQuestionButtonPressed();
    } else if (charCode === ' ') {
      this.addQuickTalk();
    } else if (charCode === 'l') {
      this.reteComp.connectSelectedNodes();
    }
  }

  public operationFeedbackMessage(type: string, msg: string) {
    let audio = new Audio();

    switch (type) {
      case ENUM_OPERATION_FEEDBACK.SUCCESS:
        this.toastr.success(msg, '');
        audio.src = './assets/SuccessSound.mp3';
        break;
      case ENUM_OPERATION_FEEDBACK.INFO:
        this.toastr.info(msg, '');
        audio.src = './assets/InfoSound.mp3';
        break;
      case ENUM_OPERATION_FEEDBACK.WARNING:
        this.toastr.warning(msg, '');
        audio.src = './assets/WarningSound.mp3';
        break;
      case ENUM_OPERATION_FEEDBACK.ERROR:
        this.toastr.error(msg, '');
        audio.src = './assets/ErrorSound.mp3';
        break;
    }

    audio.load();
    audio.play();
  }

  generateGenericLink(prev){
   
    var chatUrl = environment.baseUrl + "/chat/?data=";
  
    var str = "";
     if(prev != undefined && prev != null && prev == "preview" ){
      str = CryptoJS.AES.encrypt("preview*&*preview*&*preview*&*"+this.currentConversationId, "Cefriel").toString();
    } else {
      str = CryptoJS.AES.encrypt("*&**&**&*" + this.currentConversationId, "Cefriel").toString();
      this.genericLink = chatUrl+str;
      this.openShareDialog();
    }
    
    return chatUrl+str;
  }

  openShareDialog(){
    const dialogRef = this.dialog.open(ShareSurveyDialogComponent, {
      maxWidth: '60%',
      maxHeight: '90vh',
      data: this.genericLink
    });
  }

  openInspect(){
    if(this.currentConversationStatus == "saved"){
      this.operationFeedbackMessage("warning", "Publish the conversation first");
      return;
    }
    var url = environment.baseUrl + "/coney/inspect?data="+this.currentConversationId;
    sessionStorage.setItem('conv', this.currentConversationId);
    window.location.href = url;
  }

  copyText(){
    let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = this.genericLink;
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);

      this.operationFeedbackMessage(ENUM_OPERATION_FEEDBACK.INFO, "Copied to clipboard!");
      document.getElementById("modal-generic-link").style.display = "none";
  }

  printButtonPressed() {
    this.loadingInProgress = true;
    let endpoint = "/create/getOrderedConversation?conversationId=" + this.currentConversationId; 
    this.backend.getRequest(endpoint).subscribe(
      res => {
        this.loadingInProgress = false;
        this.printQuestions(res);
      }, err => {
        console.error(err);
        this.loadingInProgress = false;
      });
  }

  oldPrintButtonPressed() {

    var output = [];
    var json: JSON;
    json = this.editedJson;
    var nodes = json["nodes"];
    var count = 0;
    for (var i in nodes) {
      
      var node = nodes[i];

      if (node["name"].includes("Question")) {
        count++;
        var n = { order: count, type: "", text: "", tag: "", answers: [] };
        var answers = [];
        n.text = node.data.text;
        n.type = node.data.visualization;

        n.tag = node.data.tag;
        node.outputs.out.connections.forEach(element => {
          var answer = { order: 0, value: 0, text: "", nextQuestionId: -1 };

          //get answers and store them
          var res = nodes[element.node + ""];
          if (res.name.includes("multiple")) {
            answer.order = res.data.sort;
            answer.value = res.data.value;
            answer.text = res.data.text;
            answers.push(answer);
          } else if (res.name.includes("checkbox")) {
            var j = 1;
            res.data.checkbox.forEach(element => {
              var an = { order: j, value: res.data.value, text: element.v };
              j++;
              answers.push(an);
            });;
            
          } else {
            answers.push(answer);
          }
          
        });
        n.answers = answers;
        output.push(n);
      }
    }
    this.printQuestions(JSON.stringify(output));
  }

  printQuestions(input: any) {
    
    const dialogRef = this.dialog.open(PrintDialogComponent, {
      maxWidth: '900px',
      maxHeight: '85vh',
      data: {
        questions: input,
        title: this.currentConversationTitle
      }
    });
  }

  openDeliver(){
    if(!environment.enterprise){
      this.searchButtonPressed();
      return;
    }
    var url = environment.baseUrl + "/coney/home";
    window.location.href = url;
  }

}
