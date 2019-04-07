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

    this.configService.getBuiltInTemplates();

    this.storage.get('currentUser').then(x =>{
      this.currentUser = x;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
    this.configService.saveUsernameFromFirebaseToLocalDB();
  }

  saveLocalResponsesToFirebase(){
    console.log("Saving Local Responses to Firebase ...");
    try{
      this.storage.get('offline_responses').then(res =>{
        if(res){
          // for each surveyId
          for( var survId in res){
            console.log("SURVEY ID = "+survId);

            // for each responses on this survey
            for ( var responseIdx in res[survId]){
              var newUserKey = firebase.database().ref().child('responses/'+survId).push().key;
              try{
                firebase.database().ref("/responses/"+survId+"/"+newUserKey).set(res[survId][responseIdx], function(error){
                  if(error){
                    console.log("Not successful pushing local response to list of responses.");
                  }else{
                    console.log("Local responses successfully added to responses!");
                  }
                });
              }catch(e){
                console.log(e);
              }
            }
          }
        }

        setTimeout(() => {
          this.storage.set('offline_responses', []);
        }, 2000);
      });
    }catch(e){
      console.log(e);
    }
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
      this.navCtrl.push(AnswerSurveyPage, {'item' : item, 'viewOnly': false});
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
    var i;
    var surv = [];

    firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/surveylist')
    .on('value', survSnapshot => {
      this.mySurveys_ids = survSnapshot.val();

      this.mySurveys = [];
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

      this.mySurveys.reverse();
      this.storage.set('mySurveys', this.mySurveys);
    });

    firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/invitations')
    .on('value', survSnapshot => {
      var all_invitations = survSnapshot.val();

      this.survey_invites_ids = [];
      for ( var invit in all_invitations){
        this.survey_invites_ids.push(all_invitations[invit]['s_id']);
        this.invite_status[invit] = all_invitations[invit]['status'];
      }

      this.survey_invites = [];
      for(i in this.survey_invites_ids){
        surv = this.configService.getSurveyData(this.survey_invites_ids[i]);
        if(surv){
          surv['type'] = '';
          surv['type'] = 'invites';
          this.survey_invites.push(surv);
        }
      }

      if(this.survey_invites && this.invite_status){
        this.survey_invites.reverse();
        this.storage.set('survey_invites', this.survey_invites);
        this.storage.set('invite_status', this.invite_status);
      }
    });

    if(!this.configService.isConnectedToFirebase()){
      this.loadSurveysFromLocalDB();
    }
  }

  browse_templates(){
    this.navCtrl.push(TemplateListPage, {})
  }

  loadUserData(){
     if(this.configService.isConnectedToFirebase()){
      this.userData = this.configService.getUserData(this.fire.auth.currentUser.uid);
      this.configService.saveUsernameFromFirebaseToLocalDB();
    }
    else{
      this.userData = this.configService.getUserDataFromLocalDB();
    }

    this.storage.get('username').then(u =>{
      this.username = u;
    });
  }

  public ionViewDidEnter(){
    console.log("entered home page ...");

    this.loadSurveys();
    this.loadUserData();
    this.configService.getBuiltInTemplates();
  }

  public ionViewWillEnter(){
    console.log("entering home page ...");
    if(this.configService.isConnectedToFirebase()){
      this.saveLocalResponsesToFirebase();
    }
  }

  public ionViewWillLeave(){
    console.log("leaving home page ...");
  }
}