import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnswerSurveyPage } from './answer-survey';

@NgModule({
  declarations: [
    AnswerSurveyPage,
  ],
  imports: [
    IonicPageModule.forChild(AnswerSurveyPage),
  ],
})
export class AnswerSurveyPageModule {}
