import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { BackendService } from '../services/backend.service';
import { saveAs } from 'file-saver';
import { CSVRecord } from '../models/CSVModel';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  dataValueDistrBar: any;
  dataAnsDistrPie: any;
  dataDurationBar: any;
  dataOpenQuestions: any;
  dataNoValueQuestions: any;
  dataCheckboxBar: any;
  dataGeneric: any;
  dataUserView: any;

  displayGenericChart = false;
  displayMappedDataChart = false;
  displayDataOpenQuestions = false;
  displayDataNoValueQuestions = false;
  displayDataCheckboxQuestions = true;
  noConvFound = false;

  loadingInProgress = false;
  userView = false;
  enterprise = false;

  conversations: any;

  currentConversationTitle = "";
  currentConversationId = "";
  conversationSelected = false;
  currentTag = "";
  users = [];
  sessions = [];
  questions = [];
  tags = [];
  selectedQs = [];


  //searchBox
  searchProjects = ["all"];
  initialConversations = [];
  noTitleConversations = [];
  selectedProject = "";
  titleValue = "";

  getConvId = "";

  path = "./assets/csv/";
  records: any;
  param = "";

  constructor(private backend: BackendService, private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router) { }


  //Initialization

  ngOnInit() {
    this.dataValueDistrBar = [];
    this.dataAnsDistrPie = [];
    this.dataUserView = [];

    this.enterprise = environment.enterprise;

    //this controls back and forward buttons trhou queryParams changes
    this.route.queryParams.subscribe(params => {
      this.param = params['data'];
      if (this.param == null || this.param == undefined || this.param == "") {
        this.changeSurvey();
      } else {
        if (this.param.substr(0, 2) == "id") {
          sessionStorage.setItem("conv", this.param);
        }
        this.getConversations();
      }
    });
  }

  getConversations() {
    let endpoint = '/create/searchConversation?status=published'; // /create
    this.conversations = [];
    this.backend.getRequest(endpoint).subscribe(json => {

      var tmpConv = JSON.parse(json);
      if (sessionStorage.getItem("conv") != undefined && sessionStorage.getItem("conv") != null && sessionStorage.getItem("conv") != "null") {

        for (var i = 0; i < tmpConv.length; i++) {
          if (tmpConv[i].conversationId == sessionStorage.getItem("conv")) {
            this.conversationChosen(tmpConv[i].conversationId, tmpConv[i].conversationTitle, undefined);
            return;
          }
        }
      } else {

        for (var z = 0; z < tmpConv.length; z++) {
          if (tmpConv[z].status != "saved") {
            this.conversations.push(tmpConv[z]);
          }
        }
        this.initialConversations = this.conversations;

        if (this.conversations.length == 0) {
          this.noConvFound = true;
        } else {
          this.noConvFound = false;
          this.getProjects();
        }

      }
    });
  }

  getProjects() {
    for (var i = 0; i < this.conversations.length; i++) {
      var pr = this.conversations[i].projectName;
      if (!this.searchProjects.includes(pr)) {
        this.searchProjects.push(pr);
      }
    }
  }

  //Search screen functions
  selectionChanged() {

    if (this.selectedProject !== undefined && this.selectedProject !== "" && this.selectedProject !== 'all') {
      this.noTitleConversations = this.initialConversations.filter(x => x.projectName.toLowerCase() == this.selectedProject.toLowerCase());
    } else {
      this.noTitleConversations = this.initialConversations;
    }

    this.conversations = this.noTitleConversations;
    this.titleSelectionChanged();

  }

  titleSelectionChanged() {

    if (this.titleValue !== "") {
      this.conversations = this.noTitleConversations.filter(x => x.conversationTitle.toLowerCase().includes(this.titleValue.toLowerCase()));
    } else {
      this.conversations = this.noTitleConversations;
    }
  }

  //Open the conversation and read the CSV

  conversationChosen(conversationId, conversationTitle, type) {
    this.currentConversationId = conversationId;
    this.currentConversationTitle = conversationTitle;
    this.loadingInProgress = true;

    let endpoint = '/data/getAnswersOfConversation';
    endpoint = endpoint + '?conversationId=' + conversationId;

    this.backend.getRequest(endpoint).subscribe(
      (res) => {
        this.initDataRead(res);
        this.loadingInProgress = false;
        this.router.navigate([''], { queryParams: { data: this.currentConversationId } });
        sessionStorage.setItem("conv", this.currentConversationId);
      }, err => {
        this.operationFeedbackMessage("error", "No results found");
        this.loadingInProgress = false;
        this.changeSurvey();
      }
    );

  }

  initDataRead(file) {
    let csvRecordsArray = (<string>file).split(/\r\n|\n/);
    let headersRow = this.getHeaderArray(csvRecordsArray);
    this.records = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow);
    this.conversationSelected = true;
    this.loadDataToCharts();
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, header: any) {
    let csvArr = [];
    for (let i = 1; i < csvRecordsArray.length; i++) {
      //let currentRecord = (<string>csvRecordsArray[i]).split(',');

      var currentRecord = (<string>csvRecordsArray[i]).split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      if (currentRecord.length == header.length) {
        let csvRecord: CSVRecord = new CSVRecord();
        csvRecord.user = currentRecord[header.findIndex(x => x == "user")].trim().replace(/['"]+/g, '');
        csvRecord.question = currentRecord[header.findIndex(x => x == "question")].trim().replace(/["]+/g, '');
        csvRecord.questionId = currentRecord[header.findIndex(x => x == "questionId")].trim();
        csvRecord.questionType = currentRecord[header.findIndex(x => x == "questionType")].trim().replace(/["]+/g, '');
        csvRecord.language = currentRecord[header.findIndex(x => x == "language")].trim().replace(/["]+/g, '');
        csvRecord.projectId = currentRecord[header.findIndex(x => x == "projectId")].trim();
        csvRecord.projectName = currentRecord[header.findIndex(x => x == "projectName")].trim().replace(/["]+/g, '');
        csvRecord.tag = currentRecord[header.findIndex(x => x == "tag")].trim().replace(/["]+/g, '');
        csvRecord.option = currentRecord[header.findIndex(x => x == "option")].trim().replace(/["]+/g, '');
        csvRecord.value = currentRecord[header.findIndex(x => x == "value")].trim();
        csvRecord.freeAnswer = currentRecord[header.findIndex(x => x == "freeAnswer")].trim().replace(/["]+/g, '');
        csvRecord.points = currentRecord[header.findIndex(x => x == "points")].trim();
        csvRecord.date = currentRecord[header.findIndex(x => x == "date")].trim().replace(/['"]+/g, '');
        csvRecord.time = currentRecord[header.findIndex(x => x == "time")].trim().replace(/['"]+/g, '');
        csvRecord.session = currentRecord[header.findIndex(x => x == "session")].trim().replace(/['"]+/g, '');
        csvRecord.totalDuration = currentRecord[header.findIndex(x => x == "totalDuration")].trim().replace(/['"]+/g, '');
        csvArr.push(csvRecord);
      }
    }
    return csvArr;
  }

  //Reset or change view and reload data

  clean() {
    this.currentTag = "";
    this.users = [];
    this.sessions = [];
    this.questions = [];
    this.tags = [];
    this.selectedQs = [];
    this.currentConversationTitle = "";

    this.records = [];

    this.displayGenericChart = false;
    this.displayMappedDataChart = false;
    this.displayDataOpenQuestions = false;
    this.displayDataNoValueQuestions = false;
    this.dataValueDistrBar = [];
    this.dataAnsDistrPie = [];
    this.dataUserView = [];
    this.conversations = [];

    this.currentConversationTitle = "";
    this.conversationSelected = false;
    sessionStorage.setItem("conv", null);
    this.router.navigate([''], { queryParams: { data: undefined } });
  }

  changeView() {
    if (this.userView) {
      this.userView = false;
    } else {
      this.userView = true;
    }
  }

  changeSurvey() {
    this.clean();
    this.getConversations();
  }

  reloadData() {
    this.loadingInProgress = true;
    var tmpTitle = this.currentConversationTitle;
    var tmpId = this.currentConversationId;
    this.clean();
    this.conversationChosen(tmpId, tmpTitle, undefined);
  }

  //Loading data to charts

  loadDuration() {
    var dur_map = new Map();
    var duration_p = new Array();
    var duration;
    var arr = [];
    var max_d = 0;
    for (var j = 0; j < this.records.length; j++) {
      if (this.records[j].user != "" && this.records[j].totalDuration != "unfinished") {
        var x = this.records[j].totalDuration;
        duration = new Array();
        duration = x.split(":");
        duration_p[dur_map.size] = (parseInt(duration[0]) * 3600) + (parseInt(duration[1]) * 60) + (parseInt(duration[2]));
        dur_map.set(this.records[j].user, duration_p[dur_map.size]);
      }
    }
    var l = duration_p.length;
    var sum = 0; // stores sum of elements
    var sumsq = 0; // stores sum of squares
    for (var i = 0; i < duration_p.length; ++i) {
      sum += duration_p[i];
      sumsq += duration_p[i] * duration_p[i];
    }
    var mean = sum / l;
    var varience = sumsq / l - mean * mean;
    var sd = Math.sqrt(varience); // uses for data which is 3 standard deviations from the mean
    for (var i = 0; i < duration_p.length; ++i) {
      if (duration_p[i] > mean - 3 * sd && duration_p[i] < mean + 3 * sd)
        arr.push(duration_p[i]);
    }
    for (var k = 0; k < duration_p.length; k++) if (arr[k] > max_d) max_d = arr[k];

    this.dataDurationBar = { max: max_d, array: arr };
    this.displayGenericChart = true;
    this.displayMappedDataChart = true;
    this.displayDataOpenQuestions = true;
    this.displayDataNoValueQuestions = true;
  }

  loadDataToCharts() {
    this.dataGeneric = 0;
    var unfinishedTotal = 0;
    var tmpTags = [];

    this.dataUserView = [];
    this.dataNoValueQuestions = [];
    this.dataOpenQuestions = [];
    this.dataCheckboxBar = [];
    var tmpFilterObj: any;
    var tmpAnswersObj: any;

    for (var i = 0; i < this.records.length; i++) {

      var rc = this.records[i];

      if (rc.tag == "" || rc.tag == "null" || rc.tag == undefined) {
        rc.tag = "untagged";
      }

      tmpFilterObj = {
        question: undefined,
        tag: rc.tag.toLowerCase()
      }

      //sessions' list with unfinished
      var usr = rc.user;
      if (!this.users.includes(usr)) {
        this.users.push(usr);
      }

      var ssion = rc.session;
      if (!this.sessions.includes(ssion)) {
        this.sessions.push(ssion);
        if (rc.totalDuration == "unfinished") {
          unfinishedTotal++;
        }
      }

      if (rc.totalDuration == "unfinished") {
        continue;
      }

      //question + their tag list
      var question = rc.question;
      if (!this.questions.includes(question) && rc.questionType != "checkbox" && rc.questionType != "text") {
        this.questions.push(question);
        tmpFilterObj = {
          question: question,
          tag: rc.tag.toLowerCase()
        }
      }


      if (rc.questionType == "text") {
        var freeAns = rc.freeAnswer.trim().toLowerCase();
        var index = this.dataOpenQuestions.findIndex(obj => (obj.question == rc.question && obj.answer == freeAns));
        if (index == -1) {
          tmpAnswersObj = { question: rc.question, tag: rc.tag.toLowerCase(), answer: freeAns, count: 1 };
          this.dataOpenQuestions.push(tmpAnswersObj);
        } else {
          this.dataOpenQuestions[index].count += 1;
        }
      }

      //tags list
      var tag = rc.tag.toLowerCase();
      if (tag == "" || tag == "null" || tag == undefined || tag == null) {
        tag = "untagged";
      }
      if (!tmpTags.includes(tag)) {
        var tagObj = { tag: rc.tag.toLowerCase(), min: 9999, max: 0, total: 0, amount: 0 };
        this.tags.push(tagObj);
        tmpTags.push(tag);
      }
      var indexTag = tmpTags.findIndex(x => x === tag);
      if ((parseInt(rc.value) < this.tags[indexTag].min && parseInt(rc.value) != 0) || this.tags[indexTag].min == 0) {
        this.tags[indexTag].min = parseInt(rc.value);
      }
      if (parseInt(rc.value) > this.tags[indexTag].max) {
        this.tags[indexTag].max = parseInt(rc.value);
      }
      if (rc.user != "") {
        this.tags[indexTag].total += parseInt(rc.value);
        this.tags[indexTag].amount += 1;
      }


      var tmpData = {
        txtLabel: rc.option,
        value: parseInt(rc.value),
        tag: rc.tag.toLowerCase(),
        question: rc.question,
        questionId: rc.questionId,
        questionType: rc.questionType,
        user: rc.user,
        session: rc.session
      }


      if (rc.questionType == "text") {
        var freeAns = rc.freeAnswer.trim().toLowerCase();
        tmpData.txtLabel = freeAns;
      }

      if (tmpFilterObj.question != undefined) {
        this.dataAnsDistrPie.push(tmpFilterObj);
      }

      if (rc.questionType != "checkbox" && rc.questionType != "text") {
        this.dataValueDistrBar.push(tmpData); //che è?
        this.dataNoValueQuestions.push(tmpData);
      } else if (tmpData.questionType == "checkbox") {
        this.dataCheckboxBar.push(tmpData);
      }

      this.dataUserView.push(tmpData);
    }

    this.dataGeneric = { participants: this.users.length, sessions: this.sessions.length, unfinished: unfinishedTotal };
    this.loadDuration();
  }

  //Filter visualized data

  tagChosen(tag) {
    this.currentTag = tag;
    this.selectedQs = [];
  }

  selectedQuestions(questions) {
    this.selectedQs = questions;
  }

  manageChartChoice(type) {
    var div = document.getElementById('hidingDiv');
    if (div.style.height == "0px" && type == "button") {
      div.style.height = "135px";
      div.style.boxShadow = "0px 4px 5px 2px rgba(0,0,0,.14)";
    } else if (div.style.height != "0px") {
      div.style.height = "0px";
      div.style.boxShadow = "none";

    }
  }

  //Utils

  operationFeedbackMessage(type: string, msg: string) {
    switch (type) {
      case 'success':
        this.toastr.success(msg, '');
        break;
      case 'info':
        this.toastr.info(msg, '');
        break;
      case 'warning':
        this.toastr.warning(msg, '');
        break;
      case 'error':
        this.toastr.error(msg, '');
        break;
    }
  }

  downloadResultsCSV() {
    this.loadingInProgress = true;

    var strt = "res_";
    let endpoint = '/data/getAnswersOfConversation';
    endpoint = endpoint + '?conversationId=' + this.currentConversationId;

    this.backend.getRequest(endpoint).subscribe(
      (res) => {
        const blob = new Blob([res], { type: 'text/plain' });
        saveAs(blob, strt + this.currentConversationTitle + ".csv");
        this.loadingInProgress = false;
      }, err => {
        this.loadingInProgress = false;
      }
    );
  }

  downloadData(type: string, anonymize: boolean) {

    this.loadingInProgress = true;
    var strt = "";
    var end = ".csv";
    var reqType = "text/csv"
    var endpoint = "/data/";

    if (type == "csv") {
      endpoint += "getAnswersOfConversation?conversationId=" + this.currentConversationId;
      strt = "res_csv_";
    } else if (type == "chat_rdf") {
      endpoint += "getRDFOfConversation?conversationId=" + this.currentConversationId;
      strt = "conv_RDF_";
      reqType = "text/turtle";
      end = ".ttl";
    } else if (type == "results_rdf") {
      endpoint += "getRDFOfAnswers?conversationId=" + this.currentConversationId;
      strt = "res_RDF_";
      reqType = "text/turtle";
      end = ".ttl";
    } else {
      this.loadingInProgress = false;
      return;
    }

    if (anonymize) {
      endpoint += "&anonymize=true"
    }


    this.backend.getRequest(endpoint).subscribe(res => {
      this.loadingInProgress = false;

      const blob = new Blob([res], { type: reqType });

      saveAs(blob, strt + this.currentConversationTitle + end);
    }, err => {
      this.loadingInProgress = false;
      this.operationFeedbackMessage("error", "Unable to download requested file");
    });

  }

  userLogout() {
    this.router.navigate(['logout']);
  }

  openDeliver() {
    if (!environment.enterprise) {
      this.clean();
      return;
    }
    var url = environment.baseUrl + "/coney/home";
    window.location.href = url;
  }
}