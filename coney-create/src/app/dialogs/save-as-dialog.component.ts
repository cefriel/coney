import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BackendService } from '../services/backend.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-save-as-dialog',
  templateUrl: './save-as-dialog.component.html'
})

export class SaveAsDialogComponent implements OnInit{

  oldTitle = '';
  titleValue = '';
  titleFieldEmpty = false;
  projectFieldEmpty = false;
  languageFieldEmpty = false;

  showProject = environment.enterprise;

  projectValue = {projectName: "", accessLevel: 0};
  levelValue = 1;
  errorMessage = "All fields are required";
  projects = [];
  levels = [1, 2, 3];
  languageValue = '';
  languages = [{lang:"Afrikaans", tag: "af"},{lang:"Albanian ", tag: "sp"},{lang:"Arabic", tag: "ar"},{lang:"Basque", tag: "eu"},
  {lang:"Byelorussian ", tag: "be"},{lang:"Bulgarian", tag: "bg"},{lang:"Catalan", tag: "va"},{lang:"Croatian", tag: "hr"},{lang:"Czech", tag: "cs"},
  {lang:"Danish", tag: "da"},{lang:"Dutch", tag: "nl"},{lang:"English", tag: "en"},{lang:"Esperanto", tag: "eo"},{lang:"Estonian", tag: "et"},
  {lang:"Finnish", tag: "fi"},{lang:"Faronese", tag: "fo"},{lang:"French", tag: "fr"},
  {lang:"Galician", tag: "gl"},{lang:"German", tag: "de"},{lang:"Greek", tag: "el"},{lang:"Hebrew", tag: "he"},{lang:"Hungarian", tag: "hu"},
  {lang:"Icelandic", tag: "is"},{lang:"Italian", tag: "it"},{lang:"Irish", tag: "ga"},{lang:"Japanese", tag: "ja"},{lang:"Korean", tag: "ko"},
  {lang:"Latvian", tag: "lv"},{lang:"Macedonian", tag: "mk"},{lang:"Maltese", tag: "mt"},{lang:"Norwegian", tag: "nb"},
  {lang:"Polish", tag: "pl"},{lang:"Portuguese", tag: "pt"},{lang:"Romanian", tag: "ro"},
  {lang:"Russian", tag: "ru"},{lang:"Scottish", tag: "gd"},{lang:"Slovak", tag: "sk"},{lang:"Slovenian", tag: "sl"},
  {lang:"Serbian", tag: "sr"},{lang:"Spanish", tag: "es"},{lang:"Swedish", tag: "sv"},{lang:"Turkish", tag: "tr"},{lang:"Ukranian", tag: "uk"}];
  

  constructor(private backend: BackendService, public dialogRef: MatDialogRef<SaveAsDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) {
    this.titleValue = data.title;
    this.oldTitle = data.title;
   }

  
  ngOnInit() {
    if(environment.enterprise){
      this.getProjects();
    }
    console.log("enterprise: "+this.showProject);
  }

  getProjects(){
    this.projectValue = {projectName: "", accessLevel: 0};
    let endpoint = '/create/getCustomerProjects';
    this.backend.getRequest(endpoint).subscribe(res => {
      const json = JSON.parse(res);    
      this.projects = json;
      this.projectValue = this.projects[0];
    }, err => {
      console.log("No projects found");
    });
  }

  projectChanged(){
    if(this.projectValue.accessLevel == 3){
      this.levels = [1, 2, 3];
    } else if(this.projectValue.accessLevel == 2){
      this.levels = [1, 2];
    } else {
      this.levels = [1];
    }
  }

  changed(){
    this.projectFieldEmpty = false;
    this.titleFieldEmpty = false;
  }

  save() {

    
    this.titleFieldEmpty = this.titleValue === '';
    this.languageFieldEmpty = this.languageValue === '';

    if(environment.enterprise){

      this.projectFieldEmpty = this.projectValue.projectName === "";

      if (!this.titleFieldEmpty && !this.projectFieldEmpty &&  !this.languageFieldEmpty) {
        var resEnterprise = {title : this.titleValue, projectName : this.projectValue.projectName, 
          accessLevel: this.levelValue, overwrite: false,  lang : this.languageValue};
        if(this.oldTitle == this.titleValue){ resEnterprise.overwrite = true; }
        this.dialogRef.close(resEnterprise);
      } 

    } else {
      
      if (!this.titleFieldEmpty && !this.languageFieldEmpty) {
        var resPublic = {title : this.titleValue, overwrite: false,  lang : this.languageValue};
        if(this.oldTitle == this.titleValue){ resPublic.overwrite = true; }
        this.dialogRef.close(resPublic);
      } 
    
    }

  }

}
