import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { AnswerTextComponent } from './answer-text/answer-text.component';
import { AnswerScaleComponent } from './answer-scale/answer-scale.component';
import { AnswerOptionComponent } from './answer-option/answer-option.component';
import { AnswerSlideComponent } from './answer-slide/answer-slide.component';
import { AnswerEmojiComponent } from './answer-emoji/answer-emoji.component';
import { AnswerSelectComponent } from './answer-select/answer-select.component';
import { AnswerCheckboxComponent } from './answer-checkbox/answer-checkbox.component';
import { CookieConsentComponent } from './cookie-consent-dialog/cookie-consent.component';
import { ChatComponent } from './chat.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxStarsModule } from 'ngx-stars';
import { MatSliderModule, MatCheckboxModule, MatSelectModule, MatButtonModule, MatInputModule, MatDialogModule, MatProgressBarModule } from '@angular/material';
import { ChatBackendService } from './services/backend.service';
import { CookieService } from "ngx-cookie-service";

@NgModule({
  declarations: [
    ChatComponent,
    AnswerScaleComponent,
    AnswerTextComponent,
    AnswerOptionComponent,
    AnswerSlideComponent,
    AnswerEmojiComponent,
    AnswerSelectComponent,
    AnswerCheckboxComponent,
    CookieConsentComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    NgxStarsModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    HttpClientModule,
    MatProgressBarModule,
    RouterModule.forRoot([])
  ], exports: [
    AnswerTextComponent,
    ChatComponent,
    MatDialogModule,
    AnswerScaleComponent,
    AnswerOptionComponent,
    AnswerSlideComponent,
    AnswerEmojiComponent,
    AnswerSelectComponent
  ],
  providers: [
    CookieService,
    ChatBackendService],
  bootstrap: [
    ChatComponent
  ]
})
export class ChatModule { }
