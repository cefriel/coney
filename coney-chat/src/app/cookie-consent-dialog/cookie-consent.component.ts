import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatButtonModule, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-cookie-consent',
  templateUrl: './cookie-consent.component.html'
})
export class CookieConsentComponent implements OnInit {

  privacyNoticeLink:string;
  language:string;

  constructor(public dialogRef: MatDialogRef<CookieConsentComponent>,
    @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {
    console.log(this.data);
    this.privacyNoticeLink = environment.privacyUrl; 
    this.language = this.data.lang;

  }

  agreeAndCloseDialog(){
    this.dialogRef.close("agree");
  }
}
