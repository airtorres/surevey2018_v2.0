import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

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
  author;
  created_date;
  updated_date;
  num_responses = 0;

  currUser;
  thisResponses = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    public configService: ConfigurationProvider,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController) {

    this.thisSurvey = this.navParams.get('item');
    this.loadData();
    
    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
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

  loadData(){
    this.title = this.thisSurvey['title'];
    this.isActive = this.thisSurvey['isActive'];
    this.s_id = this.thisSurvey['id'];
    this.num_responses = this.thisSurvey['num_responses'];
    this.author = this.thisSurvey['author'];

    const resp:firebase.database.Reference = firebase.database().ref('/responses/'+this.s_id);
    resp.on('value', respSnapshot => {
      if(respSnapshot.val()){
        this.num_responses = respSnapshot.numChildren();
      }
    });

    this.created_date =  this.configService.transformDateNumFormat(this.thisSurvey['created_at']);
    this.updated_date =  this.configService.transformDateNumFormat(this.thisSurvey['updated_at']);
  }

  gotoSendInvitePage(){
    let loadingUsers = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    if(this.configService.isConnectedToFirebase()){
      loadingUsers.present().then(() => {
        this.navCtrl.push(SendInvitePage, {s_id: this.s_id, title: this.title, author: this.author});
        loadingUsers.dismiss();
      });
    }
    else{
      loadingUsers.dismiss();
      this.configService.showSimpleConnectionError();
    }
  }

  gotoEdit(){
    this.navCtrl.push(CreateSurveyPage, {thisSurvey: this.thisSurvey, s_id: this.s_id});
  }

  gotoRespondentView(){
    this.navCtrl.push(AnswerSurveyPage, {'item' : this.thisSurvey, 'diff_respondent_flag': true, 'viewOnly': false});
  }

  gotoRespondentViewReadOnly(){
    this.navCtrl.push(AnswerSurveyPage, {'item' : this.thisSurvey, 'viewOnly': true});
  }

  gotoResultsPage(){
    if(this.configService.isConnectedToFirebase()){
      let loadingForResults = this.loadingCtrl.create({
        content: 'Please wait...'
      });

      // WHEN USING CONFIGSERVICE METHOD
      // loadingForResults.present();
      // setTimeout(() => {
      //   this.thisResponses = this.configService.getResponses(this.s_id);        
      // }, 1000);

      // setTimeout(() => {
      //   console.log(this.thisResponses);
      //   loadingForResults.dismiss();
      //   this.navCtrl.push(ResultsPage, {s_id: this.s_id, responses: this.thisResponses});
      // }, 1000);

      loadingForResults.present().then(() => {
        const s:firebase.database.Reference = firebase.database().ref('/responses/'+this.s_id);
        s.on('value', responsesSnapshot => {
          if(responsesSnapshot.val()){
            this.thisResponses = responsesSnapshot.val();
            loadingForResults.dismiss();
            this.navCtrl.push(ResultsPage, {s_id: this.s_id, responses: this.thisResponses});
          }
          else{
            loadingForResults.dismiss();
            this.configService.showSimpleAlert('Opsss!','There are no responses recorded yet.');
          }
        });
      });
    }
    else{
      this.configService.showSimpleConnectionError();
    }
  }

  confirmDeleteSurvey(){
    var surveyId = this.s_id;
    if(this.configService.isConnectedToFirebase()){
      this.configService.deleteSurvey(surveyId);
    }else{
      this.configService.showSimpleConnectionError();
    }

    setTimeout(() => {
      this.navCtrl.pop();
    }, 1000);
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

  public ionViewWillEnter(){
    console.log("entering survey-summary page ...");
    this.loadData();
  }

}