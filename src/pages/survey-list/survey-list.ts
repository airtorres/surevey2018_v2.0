import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SurveySummaryPage } from '../survey-summary/survey-summary';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the SurveyListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-survey-list',
  templateUrl: 'survey-list.html',
})
export class SurveyListPage {
	surveyList: string = "all";
  item;

  currUser;
  surveys = {};

  mySurveys = [];
  mySurveys_ids = [];

  survey_invites = [];
  survey_invites_ids = [];

  invite_status = {};

  // mySurveys + survey invites: NOT USED IN HTML
  all_surveys = [];
	
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fire: AngularFireAuth,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveyListPage');
  }

  gotoSummary(item){
  	this.navCtrl.push(SurveySummaryPage, {'item' : item});
  }

  gotoRespondentView(item){
    this.navCtrl.push(AnswerSurveyPage, {'item' : item});
  }

  loadSurveysFromLocalDB(){
    this.storage.get("mySurveys").then(mySurv => {
        this.mySurveys = mySurv;
    });
    this.storage.get("survey_invites").then(invites => {
        this.survey_invites = invites;
    });
    this.storage.get("all_surveys").then(all => {
        this.all_surveys = all;
    });
  }

  fetchSurveys(){
    // fetch mysurveys from firebase
    try{
      var user_to_survey = [];
      const userSurveyRef:firebase.database.Reference = firebase.database().ref('/user_surveys');
      userSurveyRef.on('value', userToSurveySnapshot => {
        user_to_survey = userToSurveySnapshot.val();
      });

      // fetching mySurveys IDs
      for (var usr in user_to_survey){
        if (this.fire.auth.currentUser.email == user_to_survey[usr]['email']){
          if(user_to_survey[usr]['surveylist']){
            this.mySurveys_ids = user_to_survey[usr]['surveylist'];
          }
        }
      }
      // fetching mySurveyInvitations IDs
      for (var inv in user_to_survey){
        if (this.fire.auth.currentUser.email == user_to_survey[inv]['email']){
          if(user_to_survey[inv]['invitations']){
            this.survey_invites_ids = user_to_survey[inv]['invitations'];
          }
        }
      }

      var i;
      var temp = {};
      for(i in this.mySurveys_ids){
        const mysurv:firebase.database.Reference = firebase.database().ref('/surveys/'+this.mySurveys_ids[i]);
        mysurv.on('value', mysurvSnapshot => {
          temp = mysurvSnapshot.val();
          temp['id'] = '';
          temp['id'] = this.mySurveys_ids[i];
          temp['type'] = '';
          temp['type'] = 'mySurvey';
          this.mySurveys.push(temp);
          this.all_surveys.push(temp);
        });
      }

      for(i in this.survey_invites_ids){
        const mysurv:firebase.database.Reference = firebase.database().ref('/surveys/'+this.survey_invites_ids[i]);
        mysurv.on('value', mysurvSnapshot => {
          temp = mysurvSnapshot.val();
          temp['id'] = '';
          temp['id'] = this.survey_invites_ids[i];
          temp['type'] = '';
          temp['type'] = 'invites';
          this.survey_invites.push(temp);
          this.all_surveys.push(temp);
        });
      }

      // saving surveys to local storage for offline access
      this.storage.set('mySurveys', this.mySurveys);
      this.storage.set('survey_invites', this.survey_invites);
      this.storage.set('all_surveys', this.all_surveys);
    }catch(e){
      console.log("Error occurs while fetching survey list.");
      this.loadSurveysFromLocalDB();
    }
  }

  public ionViewWillEnter() {
    this.surveys = {};

    this.mySurveys = [];
    this.mySurveys_ids = [];

    this.survey_invites = [];
    this.survey_invites_ids = [];

    // mySurveys + survey invites
    this.all_surveys = [];
    this.fetchSurveys();
  }

}
