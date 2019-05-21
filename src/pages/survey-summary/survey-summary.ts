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
    public loadingForResultsCtrl: LoadingController) {

    this.thisSurvey = this.navParams.get('item');
    
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
    this.title = this.thisSurvey['title'];
    this.isActive = this.thisSurvey['isActive'];
    this.s_id = this.thisSurvey['id'];

    firebase.database().ref('/surveys/'+this.s_id)
    .on('value', sSnapshot => {
      var s = sSnapshot.val();
      if(s){
        this.title = s['title'];
      }
    });

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
    let loadingUsers = this.loadingForResultsCtrl.create({
      content: 'Please wait...'
    });

    if(this.configService.isConnectedToFirebase()){
      loadingUsers.present().then(() => {
        loadingUsers.dismiss();
        this.navCtrl.push(SendInvitePage, {s_id: this.s_id, title: this.title, author: this.author});
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
      let loadingForResults = this.loadingForResultsCtrl.create({
        content: 'Please wait...'
      });

      loadingForResults.present().then(() => {
        const s:firebase.database.Reference = firebase.database().ref('/responses/'+this.s_id);
        s.once('value', responsesSnapshot => {
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
      title: 'Are you sure to delete this survey?',
      message: this.title,
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

    if(!this.configService.isConnectedToFirebase()){
      this.storage.get('mySurveys').then(s =>{
        for ( var i in s){
          if( s[i]['id'] == this.s_id){
            this.num_responses = s[i]['num_responses'];
          }
        }
      });
    }
  }

}