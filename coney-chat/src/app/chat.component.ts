import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
import { ChatBackendService } from './services/backend.service';
import { Block } from './models/block';
import { Params, ActivatedRoute } from '@angular/router';
import { ENUM_IT_STRINGS, ENUM_EN_STRINGS } from './models/strings.model'
import * as CryptoJS from 'crypto-js';

import $ from "jquery";
import { CookieService } from 'ngx-cookie-service';
import { MatDialog } from '@angular/material';
import { CookieConsentComponent } from './cookie-consent-dialog/cookie-consent.component';
import { environment } from 'src/environments/environment';
import { Title } from '@angular/platform-browser';



@Component({
  selector: 'app-coney-root',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewChecked {

  @Input() conv_id: string;
  @Input() userId: string;

  title = 'coney-chat';

  @ViewChild('chatContent', { static: false }) comment: ElementRef;
  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;
  scrolltop: number = null;

  languageValue: any;
  languages = [{ lang: "Afrikaans", tag: "af" }, { lang: "Albanian ", tag: "sp" }, { lang: "Arabic", tag: "ar" }, { lang: "Basque", tag: "eu" },
  { lang: "Byelorussian ", tag: "be" }, { lang: "Bulgarian", tag: "bg" }, { lang: "Catalan", tag: "va" }, { lang: "Croatian", tag: "hr" }, { lang: "Czech", tag: "cs" },
  { lang: "Danish", tag: "da" }, { lang: "Dutch", tag: "nl" }, { lang: "English", tag: "en" }, { lang: "Esperanto", tag: "eo" }, { lang: "Estonian", tag: "et" },
  { lang: "Finnish", tag: "fi" }, { lang: "Faronese", tag: "fo" }, { lang: "French", tag: "fr" },
  { lang: "Galician", tag: "gl" }, { lang: "German", tag: "de" }, { lang: "Greek", tag: "el" }, { lang: "Hebrew", tag: "he" }, { lang: "Hungarian", tag: "hu" },
  { lang: "Icelandic", tag: "is" }, { lang: "Italian", tag: "it" }, { lang: "Irish", tag: "ga" }, { lang: "Japanese", tag: "ja" }, { lang: "Korean", tag: "ko" },
  { lang: "Latvian", tag: "lv" }, { lang: "Macedonian", tag: "mk" }, { lang: "Maltese", tag: "mt" }, { lang: "Norwegian", tag: "nb" },
  { lang: "Polish", tag: "pl" }, { lang: "Portuguese", tag: "pt" }, { lang: "Romanian", tag: "ro" },
  { lang: "Russian", tag: "ru" }, { lang: "Scottish", tag: "gd" }, { lang: "Slovak", tag: "sk" }, { lang: "Slovenian", tag: "sl" },
  { lang: "Serbian", tag: "sr" }, { lang: "Spanish", tag: "es" }, { lang: "Swedish", tag: "sv" }, { lang: "Turkish", tag: "tr" }, { lang: "Ukranian", tag: "uk" }];
  getReqLanguages: any;
  filteredLanguages: any;
  defaultLanguage: any = { lang: "", tag: "" };

  strings: any;
  currentConversationId = '';
  currentConversationTitle = '';
  currentSessionId = '';
  errorMessageMainScreen = '';
  postData: JSON;
  oldPostData: JSON;
  olderPostData: JSON;
  block: Block;
  answers = [];
  answerType = null;
  showLogo = true;
  questionType = "";
  numberOfAnswers = 0;
  isLoading = true;
  undoEnabled = false;
  surveyEnded = false;
  prevUserId: any;
  convOnline: boolean;
  cookieConsent = false;
  conversationFinished = false;

  pastAnswers = false;
  //TEST
  //count = 0;

  encryptedData = '';
  projectId = null;
  projectName = null;
  noRepeat = false;
  recreatingConv = false;
  reSession = "";

  //toBeTranslated
  privacyNoticeLink = environment.privacyUrl; //"https://www.cefriel.com/en/privacy";
  privacyNotice: string;
  startButtonText: string;
  sendButtonText: string;
  skipButtonText: string;
  restartButtonText: string;
  continueButtonText: string;
  endButtonText: string;
  endScreenButtonText: string;
  doneConversation: string;
  endScreenText: string;
  consentText: string;
  cookieText: string;
  readMoreButtonText: string;
  cookieAgreeButton: string;
  wrongLinkText: string;
  unableToLoadChatText: string;
  somethingWrongText: string;
  noSurveyChosenText: string;
  surveyAlreadyCompetedText: string;
  noPublishedSurvey: string;




  constructor(private backend: ChatBackendService,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    public dialog: MatDialog,
    private titleService: Title) { }

  //prevents page unload if there are changes to be saves
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {

    if (!this.conversationFinished) {
      if (this.userId == "preview") {
        this.backend.deleteObject('/chat/deletePreview?conversationId=' + this.currentConversationId + "&session=" + this.currentSessionId).subscribe(json => {
          $event.returnValue = true;
        });
      }
    }
  }

  ngOnInit() {

    this.getBrowserLanguage();

    this.cookieConsent = this.cookieService.get('cco') === "true";
    if (this.cookieConsent) { this.hideBanner(undefined); }

    this.currentConversationTitle = '';
    this.currentConversationId = '';
    this.currentSessionId = '';
    this.answerType = null;
    this.postData = JSON.parse("{}");
    this.block = {
      block_id: 0,
      text: "",
      value: 0,
      link: "",
      of_conversation: "",
      block_type: "",
      block_subtype: ""
    };

    this.answers = [];
    this.route.queryParams.forEach((params: Params) => {
      this.encryptedData = params['data'];
      if (this.encryptedData != undefined) {
        this.errorMessageMainScreen = "";
        var temp = this.encryptedData.replace(/ /g, '+');
        this.encryptedData = temp;
        var decr = CryptoJS.AES.decrypt(this.encryptedData.trim(), "Cefriel").toString(CryptoJS.enc.Utf8);
        var decrArray = decr.toString(CryptoJS.enc.Utf8).split("*&*");
        if (decrArray.length < 4) {

          document.getElementById("chat-intro").style.display = "none";
          document.getElementById("chat").style.display = "flex";
          this.publishErrorMessage(this.wrongLinkText);
          this.errorMessageMainScreen = this.unableToLoadChatText;
          this.convOnline = false;
          this.isLoading = false;
        } else {
          this.userId = decrArray[0];
          this.projectId = decrArray[1];
          this.projectName = decrArray[2].replace("%26", "&");

          this.currentConversationTitle = this.projectName;
          this.titleService.setTitle(this.projectName);
          this.conv_id = decrArray[3];

          if (decrArray[4] != undefined && decrArray != null && decrArray[4] == "noRepeat") {
            this.noRepeat = true;
          }

          if (this.userId == "preview" && this.projectName == "preview") {
            this.isLoading = false;
            this.getReqLanguages = [];

            document.getElementById("chat-intro").style.display = "none";
            document.getElementById("chat").style.display = "flex";
            this.getConversation(1);
          } else {
            this.getLanguages();
          }
        }
      } else {
        this.errorMessageMainScreen = this.noSurveyChosenText;
        this.convOnline = false;
        this.isLoading = false;
      }
    });
  }

  ngOnChanges() {
    this.scrollToBottom();
  }

  getLanguages() {
    this.defaultLanguage = { lang: "", tag: "" };
    this.getReqLanguages = [];

    let endpoint = '/chat/getLanguagesOfConversation?conversationId=' + this.conv_id;
    this.backend.getRequest(endpoint).subscribe(res => {
      this.getReqLanguages = JSON.parse(res);
      this.filteredLanguages = [];
      for (var i = 0; i < this.languages.length; i++) {
        if (this.getReqLanguages.includes(this.languages[i].tag)) {
          this.filteredLanguages.push(this.languages[i]);
        }
      }

      this.defaultLanguage = this.filteredLanguages[0];
      if (this.filteredLanguages.length == 1) {
        this.languageValue = this.defaultLanguage;
      }

      this.convOnline = true;
      this.isLoading = false;
      if (this.getReqLanguages.length == 0) {
        this.errorMessageMainScreen = "Couldn't load the languages. Something went wrong...";
      }
      this.getTitle();
    }, err => {

      this.isLoading = false;
    });
  }

  getTitle() {

    let endpoint = '/chat/beginConversation';

    endpoint = endpoint + '?conversationId=' + this.conv_id;
    endpoint = endpoint + '&titleOnly=' + "true";
    endpoint = endpoint + '&restart=' + 0;
    this.backend.getRequest(endpoint).subscribe(res => {
      this.currentConversationTitle = res.toString();
    });
  }

  cookieReadMorePressed() {
    console.log(this.languageValue);
    const dialogRef = this.dialog.open(CookieConsentComponent, {
      width: '400px',
      maxHeight: '90vh',
      data: {
        lang: this.languageValue.tag
      }
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res != undefined && res == "agree") {
        this.cookieService.set('cco', "true");
        this.hideBanner(undefined);
      }
    });
  }

  hideBanner(type: any) {
    document.getElementById("bottom-cookie-banner").style.display = "none";

    if (type != undefined) {
      this.cookieService.set('cco', "true");
    }
  }

  startSurvey() {
    document.getElementById("chat-intro").style.display = "none";
    document.getElementById("chat").style.display = "flex";
    this.getConversation(0);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  getConversation(restart: number) {

    var popUp = document.getElementById("restartPU");
    popUp.style.display = "none";

    let endpoint = '/chat/beginConversation';
    if (this.conv_id != null) {
      endpoint = endpoint + '?conversationId=' + this.conv_id;
    }
    
    endpoint = endpoint + '&lang=' + this.languageValue.tag;
    

    if (this.userId != null && this.userId != "") {
      endpoint = endpoint + '&userId=' + this.userId;
    } else if (this.userId == null || this.userId == "") {
      this.userId = this.cookieService.get("userId");

      if (this.userId != undefined && this.userId.substr(0, 2) == "u_" && this.userId.length == 8) {
        //It's random
        endpoint = endpoint + '&userId=' + this.userId;
      }
    }

    if (this.projectId != null) {
      endpoint = endpoint + '&projectId=' + this.projectId;
    }

    var tmp = this.projectName.replace("&", "%26");
    if (this.projectName != null) {
      endpoint = endpoint + '&projectName=' + tmp;
    }


    endpoint = endpoint + '&restart=' + restart;
    if (restart == 1 || restart == 2) {
      endpoint = endpoint + '&session=' + this.reSession;
    }

    if (this.noRepeat) {
      endpoint = endpoint + '&noRepeat=noRepeat';
    }

    this.backend.getRequest(endpoint).subscribe(res => {
      const json = JSON.parse(res);

      if (json["re-session"] != undefined && this.userId != "preview") {
        this.reSession = json["re-session"];
        this.restartPopUp();
        return;
      } else if (restart == 2) {
        this.recreatingConv = true;
      }

      var conversationJson = json["conversation"];
      this.currentConversationId = conversationJson["conversationId"];
      this.currentConversationTitle = conversationJson["title"];

      this.userId = json["userId"];

      //sets the cookie
      if (this.cookieConsent) {
        this.cookieService.set('userId', this.userId);
      }

      this.currentSessionId = json["session"];

      var blocksJsonArray = json["blocks"];
      this.publishMessages(blocksJsonArray);

      this.convOnline = true;

    }, err => {
      this.convOnline = false;
      if (err.status == 405) {
        this.publishErrorMessage(this.surveyAlreadyCompetedText);
        this.errorMessageMainScreen = this.surveyAlreadyCompetedText;
      } else {
        this.publishErrorMessage("");
        this.errorMessageMainScreen = "I couldn't find any available surveys";
      }
      return;
    });
  }

  publishErrorMessage(text: string) {
    var erritem = $('<li/>').addClass('chat-li coney').appendTo($('#chat-ul-list')).append($('<p/>').text(text).addClass('coney-msg message error'));
    //$('#chat-content').css("max-height", "90%");
    //$('#chat-content').css("padding-bottom", "10px");
    //$('#input-area').css("height", "1%");

    //erritem[0].innerHTML += '<img id="botImg" src="./assets/bot.svg" />';
  }

  continueConversation(undo: boolean, checkboxAnswers: any) {

    if (!undo) {

      this.postData["userId"] = this.userId;
      this.postData["session"] = this.currentSessionId;
      this.postData["conversationId"] = this.currentConversationId;
      this.postData["answerType"] = this.block.block_subtype;
      this.postData["blockId"] = this.block.block_id;
      this.postData["redo"] = "false";
      this.postData["lang"] = this.languageValue.tag;
      


      if (checkboxAnswers == undefined) {
        if (this.block.block_subtype == "multiple") {
          this.postData["answer"] = this.block.value;
        } else {
          this.postData["answer"] = this.block.text;
        }
      } else {
        this.postData["answer"] = checkboxAnswers;
      }

    } else {
      this.postData["redo"] = "true";
      this.undoEnabled = false;
      this.answers = [];
      this.answerType = null;
    }
    let endpoint = '/chat/continueConversation';
    this.backend.postRequest(endpoint, this.postData).subscribe(json => {
      var blocksJsonArray = json["blocks"];
      this.publishMessages(blocksJsonArray);
    }, err => {
      this.surveyEnded = true;
    });
  }

  sendAnswer(answer: any) {
    this.recreatingConv = false;
    if (this.answerType == "text" || this.answerType == "number" || this.answerType == "date" || this.answerType == "time" || this.answerType == "url") {
      if (answer != "skip" && answer != "") {
        $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(answer).addClass('answer message'));
      } else {
        $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text("-").addClass('answer message'));
      }
      this.block.text = answer;
    } else if (this.answerType == "slider") {
      var res = "";
      var temp = answer.value + "";

      if (answer.text != "" && (answer.text != temp)) {
        res = answer.text;
      } else {
        res = answer.value + "/" + answer.tot;
      }
      $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(res).addClass('answer message'));
      this.block.text = answer.text;
      this.block.value = answer.value;
    } else if (this.answerType == "star") {
      $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(answer.selected + "/" + answer.tot + " ⭐").addClass('answer message'));
      this.block.text = answer.text;
      this.block.value = answer.value;
    } else if (this.questionType == "checkbox") {

      for (var i = 0; i < answer.length; i++) {
        var element = answer[i].text;
        if (element.substr(0, 4) == "----") {
          element = element.substr(4, element.length);
        }
        $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(element).addClass('answer message'));
        this.block.text = element;
      }

    } else {
      $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(answer.text).addClass('answer message'));
      this.block.text = answer.text;
      this.block.value = answer.value;
    }

    this.undoEnabled = true;

    this.showLogo = true;
    this.answers = [];
    this.answerType = null;

    if (this.questionType == "checkbox") {
      this.continueConversation(false, answer);
    } else {
      this.continueConversation(false, undefined);
    }
  }

  sendPastAswer(block: any) {
    if (this.questionType == "text" || this.questionType == "open" || this.answerType == "single") {
      if (block.text != "skip" && block.text != "") {
        $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(block.text).addClass('answer message'));
      } else {
        $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text("-").addClass('answer message'));
      }
    } else if (this.questionType == "slider") {

      var res = "";
      var temp = block.text.value + "";

      if (block.text != "" && (block.text != temp)) {
        res = block.text;
      } else {
        res = block.value;
      }
      $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(res).addClass('answer message'));
      this.block.text = block.text;
      this.block.value = block.value;
    } else if (this.questionType == "star") {
      $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(block.value + " ⭐").addClass('answer message'));
      this.block.text = block.text;
      this.block.value = block.value;
    } else if (this.questionType == "checkbox") {



      if (block.text.substr(0, 4) == "----") {
        block.text = block.text.substr(4, block.text.length);
      }
      $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(block.text).addClass('answer message'));
      this.block.text = block.text;


    } else {
      $('<li/>').addClass('chat-li ans').appendTo($('#chat-ul-list')).append($('<p/>').text(block.text).addClass('answer message'));
      this.block.text = block.text;
      this.block.value = block.value;
    }
  }


  delay(time: any) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async sendWithDelay(param: any, delayType: string) {
    let temp_block: Block;
    temp_block = {
      block_id: 0,
      text: "",
      value: 0,
      link: "",
      of_conversation: "",
      block_type: "",
      block_subtype: ""
    };

    temp_block.text = param["text"];

    let delay = 200;

    let numberOfWord = 0;
    if (temp_block.text != null && delayType == "auto") {
      numberOfWord = temp_block.text.split(' ').length;
      delay = 100 * numberOfWord + 150;
    }

    this.isLoading = true;
    //$('#input-area').css("height", "8%");
    await this.delay(delay);

    temp_block.block_subtype = param["subtype"];

    var litem: any;
    if (temp_block.block_subtype == "text") {

      litem = $('<li/>').addClass('chat-li coney').appendTo($('#chat-ul-list')).append($('<p/>').text(temp_block.text).addClass('coney-msg message'));

    } else if (temp_block.block_subtype == "imageUrl") {

      temp_block.link = param["imageUrl"];
      litem = $('<li/>').addClass('chat-li coney').appendTo($('#chat-ul-list')).append($('<img/>').attr('align', 'left').attr('src', temp_block.link).addClass('coney-msg img-url message'));

    } else {

      temp_block.link = param["url"];
      litem = $('<li/>').addClass('chat-li coney').appendTo($('#chat-ul-list')).append(($('<div/>').addClass('row m-0')).append($('<a/>').attr('href', temp_block.link).attr('target', '_blank').attr('rel', 'noopener').text(temp_block.text).addClass('coney-msg link message')));

    }
    if (this.showLogo) {
      this.showLogo = false;
    }
    this.isLoading = false;
    await this.delay(100);
    this.scrollToBottom();
  }

  async publishMessages(messages: any) {

    var c = true;
    for (var k = 0; k < messages.length; k++) {

      var block = messages[k];
      this.block.block_type = block["type"];
      this.block.block_subtype = block["subtype"];
      this.block.of_conversation = block["ofConversation"];
      this.block.text = block["text"];
      this.block.value = parseInt(block["order"], 10);

      if (this.block.block_type == "AnswerCont") {
        this.pastAnswers == true;
      } else if (this.block.block_type == "Answer") {
        this.pastAnswers == false;
      }

      if (this.block.block_type == "Question") {
        this.questionType = block["visualization"];
      }

      if ((this.questionType == "" || this.questionType == undefined) && (this.block.block_type == "Answer" || this.block.block_type == "AnswerCont")) {
        if (block["subtype"] == "multiple") {
          this.questionType = "star";
        } else if (block["subtype"] == "single") {
          this.questionType = "text";
        } else {
          this.questionType = block["subtype"];
        }
      }


      if (this.block.block_type == "end") {
        if (this.block.text != null) {
          $('<li/>').addClass('chat-li coney').appendTo($('#chat-ul-list')).append($('<p/>').text(this.block.text).addClass('coney-msg message error'));
        } else {
          this.surveyEnded = true;

          if (this.userId == "preview") {
            this.undoEnabled = false;
            this.backend.deleteObject('/chat/deletePreview?conversationId=' + this.currentConversationId + "&session=" + this.currentSessionId).subscribe(bool => {
            });
          }
        }
        c = false;


        /*TEST
        this.count ++;
        if(this.count<20){
          var tmpu = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
          this.userId = tmpu+"@gmail.com";
          this.getConversation();
        }
        /*END TEST*/

        return;
      }

      if (this.block.block_type != "Answer" && this.block.block_type != "AnswerCont") {

        this.block.block_id = block["blockId"];
        if (this.recreatingConv) {
          await this.sendWithDelay(block, "none");
        } else {
          await this.sendWithDelay(block, "auto");
        }


      } else if (this.block.block_type == "Answer") {

        var genAns: { text: any; value: any; };

        if (this.block.block_subtype == "multiple" || this.questionType == "checkbox") {

          //answer multi
          genAns = { value: 0, text: "" };
          genAns.text = this.block.text;
          genAns.value = this.block.value;
          this.answers.push(genAns);
        }

      } else if (this.block.block_type == "AnswerCont") {
        //Means it's returning to a previous "save"
        this.sendPastAswer(this.block);
      }
    }
    //if the survey is not over
    if (c) {
      await this.showAnswers();
    }
    return c;
  }

  undoLastAnswer() {
    this.surveyEnded = false;
    var list = document.getElementsByTagName("li");
    var ansCount = false;
    var delQ = false;

    for (var i = list.length; i > 0; i--) {

      var el = list[i - 1];
      var cname = el.className;

      if (!delQ) {
        el.remove();
        if (cname.includes("ans")) {
          ansCount = true;
        }
        if (!cname.includes("ans") && ansCount) {
          delQ = true;
        }

      } else {
        break;
      }
    }
    this.continueConversation(true, undefined);
  }

  async showAnswers() {
    this.numberOfAnswers = this.answers.length;
    if ((this.block.block_subtype == "multiple" && this.questionType != "slider") || this.block.block_subtype == "checkbox") {
      this.answers.sort(function (a, b) {
        return a.value - b.value;
      });
    }

    setTimeout(() => {
      this.isLoading = false;

      if (this.questionType == "") {
        this.questionType = "text"; /************/
      }
      this.answerType = this.questionType;

      /*TESTING
      console.log("TESTING - automated response");
      if(this.questionType !="text"){
        
        var r = Math.floor(Math.random() * Math.floor(this.answers.length));
        r+=1;
        if(this.answers.length==2){
          r=2;
        }
        this.answers.forEach(element => {
          if(element.value == r){
            this.sendAnswer(element);
          }
        });
      } else {
        this.sendAnswer("TESTING - automated response");
      }
      /*END TESTING*/
    }, 200);
  }

  showEndScreen(mode: boolean) {
    this.conversationFinished = true;
    var screen = document.getElementById("endScreen");
    var chat = document.getElementById("chat-ul-list");
    var btn = document.getElementById("endButton");
    var inputArea = document.getElementById("input-area");

    if (mode) {

      screen.style.display = "block";
      chat.style.display = "none";
      btn.style.display = "none";
      inputArea.style.display = "none";

      this.undoEnabled = false;

    } else {

      screen.style.display = "none";
      chat.style.display = "block";
      btn.textContent = this.endButtonText;
      btn.classList.remove("mat-primary");
      btn.style.display = "block";
      inputArea.style.display = "block";

    }
  }

  restartPopUp() {
    var popUp = document.getElementById("restartPU");
    popUp.style.display = "flex";
  }

  setButtonsLanguage() {


    if (this.languageValue.tag == "it") {
      this.strings = ENUM_IT_STRINGS;
    } else {
      this.strings = ENUM_EN_STRINGS;
    }

    this.privacyNotice = this.strings.privacyNotice;
    this.startButtonText = this.strings.startButtonText;
    this.sendButtonText = this.strings.sendButtonText;
    this.skipButtonText = this.strings.skipButtonText;
    this.restartButtonText = this.strings.restartButtonText;
    this.continueButtonText = this.strings.continueButtonText;
    this.endButtonText = this.strings.endButtonText;
    this.endScreenButtonText = this.strings.endScreenButtonText;
    this.doneConversation = this.strings.doneConversation;
    this.endScreenText = this.strings.endScreenText;
    this.consentText = this.strings.consentText;
    this.cookieText = this.strings.cookieText;
    this.readMoreButtonText = this.strings.readMoreButtonText;
    this.cookieAgreeButton = this.strings.cookieAgreeButton;
    this.wrongLinkText = this.strings.wrongLinkText;
    this.unableToLoadChatText = this.strings.unableToLoadChatText;
    this.somethingWrongText = this.strings.somethingWrongText;
    this.noSurveyChosenText = this.strings.noSurveyChosenText;
    this.surveyAlreadyCompetedText = this.strings.surveyAlreadyCompetedText;
    this.noPublishedSurvey = this.strings.noPublishedSurvey;

  }

  getBrowserLanguage() {
    var langArr = navigator.language.split("-");
    this.languageValue = { lang: "", tag: "" };
    this.languageValue.tag = langArr[0];
    this.setButtonsLanguage();
  }

}
