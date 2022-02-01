import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { AddQuickQuestionDialogComponent } from './dialogs/add-quick-question-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import { DeleteDialogComponent } from './dialogs/delete-dialog.component';
import { PrintDialogComponent } from './dialogs/print-dialog.component';
import { PublishDialogComponent } from './dialogs/publish-dialog.component';
import { SaveAsDialogComponent } from './dialogs/save-as-dialog.component';
import { SearchConvDialogComponent } from './dialogs/search-conv-dialog.component';
import { SearchTagDialogComponent } from './dialogs/search-tag-dialog.component';
import { TranslationDialogComponent } from './dialogs/translation-dialog.component';
import { ShareSurveyDialogComponent } from './dialogs/share-survey-dialog.component';
import { BackendService } from './services/backend.service';
import { RoutingService } from './services/routing.service';
import { ReteComponent } from './rete/rete.component';
import { AppRoutingModule } from './routing.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatInputModule, MatDialogModule, MatProgressSpinnerModule,
  MatSliderModule, MatSelectModule, MatCheckboxModule, MatRadioModule,
  MatButtonModule, MatProgressBarModule
} from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgxPrintModule } from 'ngx-print';

import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { AuthHtppInterceptorService } from './services/auth-http-interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AddQuickQuestionDialogComponent,
    ConfirmDialogComponent,
    DeleteDialogComponent,
    PrintDialogComponent,
    PublishDialogComponent,
    SaveAsDialogComponent,
    SearchConvDialogComponent,
    SearchTagDialogComponent,
    TranslationDialogComponent,
    ShareSurveyDialogComponent,
    ReteComponent,
    LoginComponent,
    LogoutComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatSliderModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    MatInputModule,
    NgbModule,
    RouterModule,
    NgxPrintModule,
    ToastrModule.forRoot()
  ],
  exports: [
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: AuthHtppInterceptorService, multi: true
    },
    BackendService,
    RoutingService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    SearchConvDialogComponent,
    SaveAsDialogComponent,
    DeleteDialogComponent,
    ConfirmDialogComponent,
    PublishDialogComponent,
    AddQuickQuestionDialogComponent,
    PrintDialogComponent,
    SearchTagDialogComponent,
    TranslationDialogComponent,
    ShareSurveyDialogComponent
  ]
})
export class AppModule { }
