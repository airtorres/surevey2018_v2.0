import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateSurveyPage } from './create-survey';

@NgModule({
  declarations: [
    CreateSurveyPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateSurveyPage),
  ],
})
export class CreateSurveyPageModule {}
