import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SendInvitePage } from '../send-invite/send-invite';
import { CreateSurveyPage } from '../create-survey/create-survey';

/**
 * Generated class for the SurveySummaryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-survey-summary',
  templateUrl: 'survey-summary.html',
})
export class SurveySummaryPage {
  isActive;
  thisSurvey;
  title;
  s_id;
  created_date;
  updated_date;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.thisSurvey = navParams.get('item');

    this.title = this.thisSurvey['title'];
    this.isActive = this.thisSurvey['isActive'];
    this.s_id = this.thisSurvey['id'];

    var date = this.thisSurvey['created_at'];
    date = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.created_date =  date;

    date = this.thisSurvey['updated_at'];
    date = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.updated_date =  date;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveySummaryPage');
  }

  gotoSendInvitePage(){
  	this.navCtrl.push(SendInvitePage, {s_id: this.s_id});
  }

  gotoEdit(){
    this.navCtrl.push(CreateSurveyPage, {thisSurvey: this.thisSurvey});
  }

}