import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BackendService } from '../services/backend.service';
import { saveAs } from 'file-saver';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'translation-dialog',
  templateUrl: './translation-dialog.component.html'
})

export class TranslationDialogComponent {

  @ViewChild('fileImportInput', { static: false }) fileImportInput: any;

  selectedLanguage: any;
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

  isLoading = false;
  isBeingConfirmed = false;
  emptyFields = false;
  uploadButtonEnabled = false;
  areTranslationsPresent = false;
  errorMessage = "All fields are required";
  conversationId = "";
  conversationTitle = "";
  csvContent: string;
  jsonToReturn: any;
  public csvRecords: any[] = [];

  constructor(private backend: BackendService,
    private papa: Papa,
    public dialogRef: MatDialogRef<TranslationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data) {
    this.conversationId = data.conversationId;
    this.conversationTitle = data.conversationTitle;
  }

  fileChangeListener($event: any): void {

    this.emptyFields = false;
    var files = $event.srcElement.files;

    if (this.isCSVFile(files[0])) {
      
      this.papa.parse(files[0], {
        encoding: "ansi_x3.4-1968",
        complete: (result) => {
          let headersRow = result.data[0];
          if (!this.isHeaderValid(headersRow)) {
            this.emptyFields = true;
            this.errorMessage = "The CSV header format is not supported";
            this.fileReset();
            return;
          }

          this.csvRecords = this.getDataRecordsArrayFromCSVFile(result.data, headersRow.length);
          this.uploadButtonEnabled = true;
        }
        
      });
    } else {
      alert("Please import valid .csv file.");
      this.fileReset();
    }
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = csvRecordsArr[0].split(",");
    let headerArray = [];

    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    let dataArr = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {

      let row = csvRecordsArray[i];
      if (row.length == headerLength) {
        let blockRecord: any = {};

        blockRecord.block_id = row[0].trim().replace(/"/g, ""),
          blockRecord.translation = row[3].trim().replace(/"/g, "")
        if (blockRecord.translation != "") {
          this.areTranslationsPresent = true;
        }
        dataArr.push(blockRecord);
      }
    }
    return dataArr;
  }

  isHeaderValid(header: any) {
    return header[0] == "block_id" && header[1] == "type" && header[2] == "text"
      && header[3] == "translation";
  }

  isCSVFile(file: any) {
    return file.name.endsWith(".csv");
  }

  fileReset() {
    this.fileImportInput.nativeElement.value = "";
    this.csvRecords = [];
    this.areTranslationsPresent = false;
    this.isLoading = false;
    this.isBeingConfirmed = false;
    this.uploadButtonEnabled = false;
  }

  selectSelChanged() {
    this.emptyFields = false;
  }

  uploadCSV() {
    if (this.selectedLanguage == undefined || this.selectedLanguage.tag == undefined || this.csvRecords.length == 0) {
      this.errorMessage = "All fields are required";
      this.emptyFields = true;
      return;
    } else if (!this.areTranslationsPresent) {
      this.emptyFields = true;
      this.errorMessage = "No translated blocks were found";
      return;
    }

    this.jsonToReturn = {
      conversationId: this.conversationId,
      language: this.selectedLanguage.tag,
      blocks: this.csvRecords
    };

    this.emptyFields = false;
    this.isBeingConfirmed = true;
  }

  goBack() {
    this.isBeingConfirmed = false;
  }

  sendData() {

    this.isLoading = true;
    var json = JSON.parse(JSON.stringify(this.jsonToReturn));

    let endpoint = '/create/uploadTranslation';

    this.backend.postJson(endpoint, json).subscribe(
      (res) => {

        var r: boolean = (JSON.stringify(res) == "true");
        if (r) {
          this.dismissDialog();
        }
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
      }
    );
  }

  downloadCSV() {

    this.isLoading = true;

    var strt = "translation_";
    let endpoint = '/create/getTranslationCSV';
    endpoint = endpoint + '?conversationId=' + this.conversationId;

    this.backend.getRequest(endpoint).subscribe(
      (res) => {
        const blob = new Blob([res], { type: 'text/plain' });
        saveAs(blob, strt + this.conversationTitle + ".csv");
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
      }
    );
  }

  dismissDialog() {
    this.dialogRef.close("translation_uploaded");
  }
}
