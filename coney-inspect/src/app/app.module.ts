import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';

import { BackendService } from './services/backend.service';
import { AppComponent } from './app.component';
import { QuestionsCheckboxComponent } from './cards/questions-checkbox/questions-checkbox.component'
import { ValueDistrBarChart } from './cards/value-distr-bar-chart/value-distr-bar-chart.component';
import { DurationBarChartComponent } from './cards/duration-bar-chart/duration-bar-chart.component';

import { MatMenuModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatRadioModule, 
  MatProgressBarModule, MatSelectModule, MatInputModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GenericDataChartComponent } from './cards/generic-data-chart/generic-data-chart.component';
import { MeanPerTagComponent } from './cards/mean-per-tag/mean-per-tag.component';
import { MeanDistrTagChartComponent } from './cards/mean-distr-tag-chart/mean-distr-tag-chart.component';
import { OpenEndedQuestionsComponent } from './cards/open-ended-questions/open-ended-questions.component';
import { MultipleChoicePieChartComponent } from './cards/multiple-choice-label-chart/multiple-choice-pie-chart.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { AuthHtppInterceptorService } from './services/auth-http-interceptor.service';
import { CheckboxBarChartComponent } from './cards/checkbox-bar-chart/checkbox-bar-chart.component';
import { UserViewComponent } from './cards/user-view/user-view.component';

@NgModule({
  declarations: [
    AppComponent,
    QuestionsCheckboxComponent,
    ValueDistrBarChart,
    DurationBarChartComponent,
    GenericDataChartComponent,
    MeanPerTagComponent,
    MeanDistrTagChartComponent,
    OpenEndedQuestionsComponent,
    MultipleChoicePieChartComponent,
    UserViewComponent,
    HomeComponent,
    LoginComponent,
    LogoutComponent,
    CheckboxBarChartComponent,
    UserViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressBarModule,
    ToastrModule.forRoot()
  ],
  exports: [
    MatProgressBarModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: AuthHtppInterceptorService, multi: true
    },
    BackendService],
  bootstrap: [AppComponent]
})

export class AppModule { }
