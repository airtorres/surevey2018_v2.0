import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';

import { SendInvitePage } from '../send-invite/send-invite';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ResultsPage } from '../results/results';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import * as firebase from 'firebase/app';
import 'firebase/database';
import { Storage } from '@ionic/storage';

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
  isActive = true;
  thisSurvey;
  title;
  s_id;
  created_date;
  updated_date;
  num_responses = 0;

  currUser;
  responses;
  thisResponses = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    public configService: ConfigurationProvider,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl : ToastController) {

    this.thisSurvey = this.navParams.get('item');

    this.title = this.thisSurvey['title'];
    this.isActive = this.thisSurvey['isActive'];
    this.s_id = this.thisSurvey['id'];
    this.num_responses = this.thisSurvey['num_responses']? this.thisSurvey['num_responses']:0;

    this.created_date =  this.configService.transformDate(this.thisSurvey['created_at']);
    this.updated_date =  this.configService.transformDate(this.thisSurvey['updated_at']);

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    this.storage.get('responses').then(res => {
      this.responses = res;
    });

    try{
      firebase.database().ref('/users/').on('value', val => {});
    }catch(e){
      console.log(e);
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveySummaryPage');
  }

  gotoSendInvitePage(){
      let loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      loading.present();

      setTimeout(() => {
        this.navCtrl.push(SendInvitePage, {s_id: this.s_id});
      }, 1000);

      setTimeout(() => {
        loading.dismiss();
      }, 1000);

  	// this.navCtrl.push(SendInvitePage, {s_id: this.s_id});
  }

  gotoEdit(){
    this.navCtrl.push(CreateSurveyPage, {thisSurvey: this.thisSurvey, s_id: this.s_id});
  }

  gotoRespondentView(){
    this.navCtrl.push(AnswerSurveyPage, {'item' : this.thisSurvey, 'diff_respondent_flag': true});
  }

  gotoResultsPage(){
    // generate results from local responses
    if (this.responses){
      for( var r in this.responses['responses']){
        if (this.responses['responses'][r]['survey_id'] == this.s_id) {
          this.thisResponses.push(this.responses['responses'][r]);
        }
      }
    }

    console.log(this.thisResponses);

    this.navCtrl.push(ResultsPage, {s_id: this.s_id, responses: this.thisResponses});
  }

  confirmDeleteSurvey(){
    let loading = this.loadingCtrl.create({
      content: 'Deleting survey...'
    });

    loading.present().then(() => {
      var surveyId = this.s_id;
      if(this.configService.isConnectedToFirebase()){
        this.configService.deleteSurvey(surveyId);
      }else{
        this.configService.showSimpleConnectionError();
      }

      loading.dismiss();
      this.navCtrl.pop();
    });
  }

  deleteSurvey(){
    let alert = this.alertCtrl.create({
      title: 'Warning',
      message: 'Are you sure to delete this survey?',
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked. Do not delete survey.');
        }
      },
      {
        text: 'Delete',
        handler: () => {
          console.log('deleting survey ...');
          this.confirmDeleteSurvey();
        }
      }
    ]
    });
    alert.present();
  }

  updateSurveyStatus(){
    console.log("updating isActive status of survey "+this.s_id);
    this.configService.updateSurveyStatus(this.s_id, this.isActive);
  }

  public ionViewWillLeave(){
    console.log("leaving survey-summary page ...");
    // this.navCtrl.pop();
  }

}