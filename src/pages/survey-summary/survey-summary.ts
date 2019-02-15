import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController } from 'ionic-angular';

import { SendInvitePage } from '../send-invite/send-invite';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ResultsPage } from '../results/results';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { AngularFireAuth } from '@angular/fire/auth';
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
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl : ToastController) {

    this.thisSurvey = this.navParams.get('item');

    this.title = this.thisSurvey['title'];
    this.isActive = this.thisSurvey['isActive'];
    this.s_id = this.thisSurvey['id'];
    this.num_responses = this.thisSurvey['num_responses']? this.thisSurvey['num_responses']:0;

    var date = new Date(this.thisSurvey['created_at']);
    var dateVal = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.created_date =  dateVal;

    date = new Date(this.thisSurvey['updated_at']);
    dateVal = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.updated_date =  dateVal;

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
      firebase.database().ref('/surveys/'+this.s_id).remove(
        function(error) {
        if(error){
          console.log("Not able to delete survey on list");
        }else{
          console.log("Survey Deleted on survey List!");
        }
      });

      // deleting all responses for this survey
      firebase.database().ref('/responses/'+this.s_id).remove(
        function(error) {
        if(error){
          console.log("Not able to delete responses.");
        }else{
          console.log("Responses for this survey are deleted!");
        }
      });

      // deleting survey id from user_to_survey
      var mySurvs = [];
      const surv:firebase.database.Reference = firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/surveylist');
      surv.on('value', survSnapshot => {
        mySurvs = survSnapshot.val();
      });

      var thisPrompt = this;
      for (var m in mySurvs){
        if(this.s_id == mySurvs[m]){
          firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/surveylist/'+m).remove(
            function(error) {
              if(error){
                console.log("Not able to delete survey on user_survey");
              }else{
                console.log("Survey Deleted on user_survey!");
                try{
                  // Assume successful delete
                  thisPrompt.configService.displayToast('Survey Deleted!');
                }catch(e){
                  console.log(e);
                }
              }
            }
          );
        }
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

    firebase.database().ref("/surveys/"+this.s_id+"/isActive").set(this.isActive, function(error){
      if(error){
        console.log("Cannot update survey status."+error);
      }else{
        console.log("Survey status updated!");
      }
    });
  }

  public ionViewWillLeave(){
    console.log("leaving survey-summary page ...");
    // this.navCtrl.pop();
  }

}