import { Component } from '@angular/core';
import { NavController, App, LoadingController } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ProfilePage } from '../profile/profile';
import { SettingPage } from '../setting/setting';
import { TemplateListPage } from '../template-list/template-list';

import { SurveySummaryPage } from '../survey-summary/survey-summary';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

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
  username = '';
  built_in_templates = [];

  mySurveys = [];
  mySurveys_ids = [];

  survey_invites = [];
  survey_invites_ids = [];

  invite_status = {};

  userData = {};

  constructor(public navCtrl: NavController,
  	private fire: AngularFireAuth,
  	public app: App,
    public configService: ConfigurationProvider,
    public loadingCtrl: LoadingController,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currentUser = x;
    });

    try{
      this.configService.saveUsernameFromFirebaseToLocalDB();
    }catch(e){
      console.log(e);
    }

    this.storage.get('username').then(u =>{
      this.username = u;
    });

    if(this.configService.isConnectedToFirebase()){
      this.userData = this.configService.getUserData(this.fire.auth.currentUser.uid);
    }
    else{
      this.userData = this.configService.getUserDataFromLocalDB();
    }

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
    var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if(connectedToFirebaseFlag){
      this.navCtrl.push(AnswerSurveyPage, {'item' : item});
    }else{
      this.configService.showSimpleConnectionError();
    }
  }

  logout(){
    let loadingSignout = this.loadingCtrl.create({
      content: 'Signing out'
    });

    loadingSignout.present().then(() => {
    	this.fire.auth.signOut().then(() => {
        loadingSignout.dismiss();
        // navigate back to sign-in page
        this.navCtrl.popToRoot();
        this.app.getRootNav().setRoot(SigninPage);
      })
    	.catch( function(error) {
        loadingSignout.dismiss();
        this.configService.showSimpleAlert('Unable to Signout', 'Try again later.');
        console.log("got an error:", error);
      });
    });
  }

  create_survey(){
  	this.navCtrl.push(CreateSurveyPage, {});
  }

  transformDate(isoDate){
    return this.configService.transformDate(isoDate);
  }

  transformAuthorName(authorId, email){
    return this.configService.transformAuthorName(authorId, email);
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
    var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if(connectedToFirebaseFlag){
      this.mySurveys_ids = this.configService.getUserSurveysList(this.fire.auth.currentUser.uid);
      var all_invitations = this.configService.getUserInvitationsList(this.fire.auth.currentUser.uid);

      this.survey_invites_ids = [];
      for ( var invit in all_invitations){
        this.survey_invites_ids.push(all_invitations[invit]['s_id']);
        this.invite_status[invit] = all_invitations[invit]['status'];
      }

      console.log(this.mySurveys_ids);
      console.log(this.survey_invites_ids);
      console.log(this.invite_status);

      var i;
      var surv = [];

      for( i in this.mySurveys_ids){
        surv = this.configService.getSurveyData(this.mySurveys_ids[i]);
        if(surv){
          surv['type'] = '';
          surv['type'] = 'mySurvey';
          surv['num_responses'] = 0;
          surv['num_responses'] = this.configService.getNumResponses(this.mySurveys_ids[i]);

          this.mySurveys.push(surv);
        }
      }

      for(i in this.survey_invites_ids){
        surv = this.configService.getSurveyData(this.survey_invites_ids[i]);
        if(surv){
          surv['type'] = '';
          surv['type'] = 'invites';
          this.survey_invites.push(surv);
        }
      }

      this.mySurveys.reverse();
      this.survey_invites.reverse();

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
    this.built_in_templates = this.configService.getBuiltInTemplates();

    // ADDED: Hoping that it makes loading of data faster. === DEL LATER
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

  getUsername(){
    this.configService.saveUsernameFromFirebaseToLocalDB();
    this.storage.get('username').then(u =>{
      this.username = u;
    });
  }

  public ionViewWillEnter(){
    this.mySurveys = [];
    this.mySurveys_ids = [];

    this.survey_invites = [];
    this.survey_invites_ids = [];

    this.invite_status = {};

    this.loadTemplates();
    this.loadSurveys();
  }
}