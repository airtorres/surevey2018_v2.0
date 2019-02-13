import { Component } from '@angular/core';
import { NavController, App, AlertController } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ProfilePage } from '../profile/profile';
import { SettingPage } from '../setting/setting';
import { TemplateListPage } from '../template-list/template-list';

import { SurveySummaryPage } from '../survey-summary/survey-summary';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentUser;
  username;
  built_in_templates = [];

  mySurveys = [];
  mySurveys_ids = [];

  survey_invites = [];
  survey_invites_ids = [];

  invite_status = {};

  constructor(public navCtrl: NavController,
  	private fire: AngularFireAuth,
  	public app: App,
    private alertCtrl: AlertController,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currentUser = x;
    });

    this.storage.get('username').then(u =>{
      this.username = u;
    });

    this.loadSurveys();
    this.loadTemplates();
  }

  gotoProfile(){
  	this.navCtrl.push(ProfilePage, {});
  }

  gotoSettings(){
  	this.navCtrl.push(SettingPage, {});
  }

  gotoSummary(item){
    this.navCtrl.push(SurveySummaryPage, {'item' : item});
  }

  gotoAnswer(item){
    // check for Firebase connection
    var connectedToFirebaseFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Connected to Firebase.");
          connectedToFirebaseFlag = true;          
        }else {
          console.log("Error connecting to Firebase.");
          connectedToFirebaseFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

    if(connectedToFirebaseFlag){
      this.navCtrl.push(AnswerSurveyPage, {'item' : item});
    }else{
      this.showConnectionError();
    }
  }

  showConnectionError(){
    let alert = this.alertCtrl.create({
      title: 'Connection Timeout',
      message: 'You must be connected to the internet.',
      buttons: ['OK']
    });
    alert.present();
  }

  logout(){
  	this.fire.auth.signOut().then()
  	.catch( function(error) {
      console.log("got an error:", error);
    });

  	// navigate back to sign-in page
  	this.navCtrl.popToRoot();
  	this.app.getRootNav().setRoot(SigninPage);
  }

  create_survey(){
  	this.navCtrl.push(CreateSurveyPage, {});
  }

  transformDate(isoDate){
    var date = new Date(isoDate);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    var month = months[date.getMonth()];
    var day = date.getDate();
    var year = date.getFullYear();

    var dateVal = month + ' '+ day + ', ' + year;

    if (dateVal){
      return dateVal;
    }
    else{
      return "No Date Specified";
    }
  }

  transformAuthorName(authorId, email){
    var name = email;
    const user:firebase.database.Reference = firebase.database().ref('/users/'+authorId);
    user.on('value', userSnapshot => {
      var u = userSnapshot.val();

      if(u){
        var firstname = u['first_name'];
        var lastname = u['last_name'];

        if(u['first_name'] != null && u['last_name'] != null){
          name = firstname + ' ' + lastname;
        }
      }
    });

    return name;
  }

  loadSurveysFromLocalDB(){
    this.storage.get("mySurveys").then(mySurv => {
      if(mySurv){
        this.mySurveys = mySurv;
      }
    });
    this.storage.get("survey_invites").then(invites => {
      if(invites){
        this.survey_invites = invites;
      }
    });
    this.storage.get("invite_status").then(status => {
      if(status){
        this.invite_status = status;
      }
    });
  }

  loadSurveys(){
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
            temp['num_responses'] = 0;

            // getting number of responses
            const resp:firebase.database.Reference = firebase.database().ref('/responses/'+this.mySurveys_ids[i]);
            resp.on('value', respSnapshot => {
              if(respSnapshot.val()){
                temp['num_responses'] = respSnapshot.numChildren();
              }
            });
            this.mySurveys.push(temp);
          }else{
            this.mySurveys_ids.splice(i,1);
          }
        });
      }

      for(i in this.survey_invites_ids){
        const mysurv:firebase.database.Reference = firebase.database().ref('/surveys/'+this.survey_invites_ids[i]);
        mysurv.on('value', mysurvSnapshot => {
          temp = mysurvSnapshot.val();
          if(temp){
            temp['type'] = '';
            temp['type'] = 'invites';
            this.survey_invites.push(temp);
          }else{
            this.survey_invites_ids.splice(i,1);
          }
        });
      }

      // saving surveys to local storage for offline access
      this.storage.set('mySurveys', this.mySurveys);
      this.storage.set('survey_invites', this.survey_invites);
      this.storage.set('invite_status', this.invite_status);
    }
    else{
      // getting the survey data from localDB if not connected to Firebase
      this.loadSurveysFromLocalDB();
    }
  }

  loadTemplates(){
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

    // load built-in surveys from firebase
    try{
      const templateRef:firebase.database.Reference = firebase.database().ref('/built_in_templates');
      templateRef.on('value', templateSnapshot => {
        this.built_in_templates = [];
        var tempRef = templateSnapshot.val();
        for ( var temp in tempRef){
          this.built_in_templates.push(tempRef[temp]);
        }

        if(connectedToFirebaseFlag){
          // store to local storage
          const uname:firebase.database.Reference = firebase.database().ref('/users/'+this.fire.auth.currentUser.uid);
          uname.on('value', userSnapshot => {
            this.storage.set('username', userSnapshot.val()['username']);
          });
          this.storage.set('built_in_templates', this.built_in_templates);
        }
      });
    }catch(e){
      console.log("Error loading templates from firebase. Use local DB.");
      console.log(e);
    }

    try{
      firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid).on('value', u => {});
      firebase.database().ref('/surveys/').on('value', u => {});
    }catch(e){
      console.log("Error occurs while fetching survey list.");
      console.log(e);
    }
  }

  browse_templates(){
    this.navCtrl.push(TemplateListPage, {})
  }

  public ionViewWillEnter(){
    this.mySurveys = [];
    this.mySurveys_ids = [];

    this.survey_invites = [];
    this.survey_invites_ids = [];

    this.invite_status = {};

    this.loadSurveys();
  }
}