import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SurveySummaryPage } from '../survey-summary/survey-summary';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';
import { EditDraftPage } from '..//edit-draft/edit-draft';

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

  drafts = [];
	
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fire: AngularFireAuth,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    // save offline responses from localDB to Firebase
    this.syncResponsesToFirebase();

    this.storage.get('drafts').then(d =>{
      if(d){
        this.drafts = d;
      }
    });

    console.log(this.drafts);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveyListPage');
  }

  gotoDraftPage(item){
    this.navCtrl.push(EditDraftPage, {'item' : item, 'draftFlag': true});
  }

  gotoSummary(item){
  	this.navCtrl.push(SurveySummaryPage, {'item' : item});
  }

  gotoRespondentView(item){
    this.navCtrl.push(AnswerSurveyPage, {'item' : item});
  }

  syncResponsesToFirebase(){
    // check for Firebase connection
    var connectedToFirebaseFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Getting data from Firebase...");
          connectedToFirebaseFlag = true;          
        }else {
          console.log("Error loading data from Firebase.");
          connectedToFirebaseFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

    console.log(connectedToFirebaseFlag);

    if(connectedToFirebaseFlag){
      try{
        var offline_responses = [];
        this.storage.get('offline_responses').then(res =>{
          if(res){
            offline_responses = res;
          }
        });

        console.log(offline_responses);

        for( var survId in offline_responses){
          for( var resp in offline_responses[survId]){
            var newUserKey = firebase.database().ref().child('responses/'+survId).push().key;
            var thisResponse = offline_responses[survId][resp];
            firebase.database().ref("/responses/"+survId+"/"+newUserKey).set(thisResponse, function(error){
              if(error){
                console.log("Not successful pushing response to list of responses."+error);
              }else{
                console.log("Successfully added to responses!");
                // remove this response
                offline_responses[survId].splice(resp,1);
              }
            });
          }
        }

        this.storage.set('offline_responses', offline_responses);
      }catch(e){
        console.log(e);
      }
    }
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
    // check for Firebase connection
    var connectedToFirebaseFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Getting data from Firebase...");
          connectedToFirebaseFlag = true;          
        }else {
          console.log("Error loading data from Firebase.");
          connectedToFirebaseFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

    // fetch mysurveys from firebase
    if(connectedToFirebaseFlag){
      var survs = {};
      const userSurveyRef:firebase.database.Reference = firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid);
      userSurveyRef.on('value', userToSurveySnapshot => {
        survs = userToSurveySnapshot.val();
      });

      // fetching mySurveys IDs
      if(survs['surveylist']){
        this.mySurveys_ids = survs['surveylist'];
      }
      // fetching mySurveyInvitations IDs
      var all_invitations = {};
      if(survs['invitations']){
        all_invitations = survs['invitations'];
      }

      this.survey_invites_ids = [];
      for ( var invit in all_invitations){
        this.survey_invites_ids.push(all_invitations[invit]['s_id']);
        this.invite_status[invit] = all_invitations[invit]['status'];
      }

      console.log(this.mySurveys_ids);
      console.log(this.survey_invites_ids);
      console.log(this.invite_status);

      var i;
      var temp = {};
      for(i in this.mySurveys_ids){
        const mysurv:firebase.database.Reference = firebase.database().ref('/surveys/'+this.mySurveys_ids[i]);
        mysurv.on('value', mysurvSnapshot => {
          temp = mysurvSnapshot.val();
          if(temp){
            temp['type'] = '';
            temp['type'] = 'mySurvey';
            this.mySurveys.push(temp);
            this.all_surveys.push(temp);
          }else{
            this.mySurveys_ids.splice(i,1);
          }
        });
      }

      for(i in this.survey_invites_ids){
        const mysurv:firebase.database.Reference = firebase.database().ref('/surveys/'+this.survey_invites_ids[i]);
        mysurv.on('value', mysurvSnapshot => {
          if(temp){
            temp = mysurvSnapshot.val();
            temp['type'] = '';
            temp['type'] = 'invites';
            this.survey_invites.push(temp);
            this.all_surveys.push(temp);
          }else{
            this.survey_invites_ids.splice(i,1);
          }
        });
      }

      // saving surveys to local storage for offline access
      this.storage.set('mySurveys', this.mySurveys);
      this.storage.set('survey_invites', this.survey_invites);
      this.storage.set('all_surveys', this.all_surveys);
      this.storage.set('invite_status', this.invite_status);
    }
    else{
      // getting the survey data from localDB if not connected to Firebase
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
