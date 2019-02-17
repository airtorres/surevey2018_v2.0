import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ToastController, AlertController, LoadingController } from 'ionic-angular';

import { SurveySummaryPage } from '../survey-summary/survey-summary';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';
import { EditDraftPage } from '../edit-draft/edit-draft';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

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
  offline_responses = [];
	
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetController: ActionSheetController,
    private alertCtrl: AlertController,
    public toastCtrl : ToastController,
    public loadingCtrl: LoadingController,
    public configService: ConfigurationProvider,
    private fire: AngularFireAuth,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    this.storage.get('drafts').then(d =>{
      if(d){
        this.drafts = d;
      }
    });

    try{
      this.storage.get('offline_responses').then(res =>{
        if(res){
          this.offline_responses = res;
        }
      });
    }catch(e){
      console.log(e);
    }

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
    // check for Firebase connection
    var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if(connectedToFirebaseFlag && this.invite_status[item['id']] != 'completed'){
      this.navCtrl.push(AnswerSurveyPage, {'item' : item});
    }else if(this.invite_status[item['id']] != 'completed'){
      this.configService.showSimpleConnectionError();
    }
  }

  syncResponsesToFirebase(){
    // check for Firebase connection
   var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if(connectedToFirebaseFlag){
      for( var survId in this.offline_responses){
        console.log(survId);
        for( var resp in this.offline_responses[survId]){
          var newUserKey = firebase.database().ref().child('responses/'+survId).push().key;
          var thisResponse = this.offline_responses[survId][resp];
          var successFlag = true;
          console.log(thisResponse);
          firebase.database().ref("/responses/"+survId+"/"+newUserKey).set(thisResponse, function(error){
            if(error){
              console.log("Not successful pushing response to list of responses."+error);
              successFlag = false;
            }else{
              console.log("Successfully added to responses!");
            }
          });
          if(successFlag){
            // remove this response
            this.offline_responses[survId].splice(resp,1);
          }
        }
      }
      console.log(this.offline_responses);
      // TEMP ONLY
      this.offline_responses = [];
      this.storage.set('offline_responses', this.offline_responses);
    }
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
    this.storage.get("all_surveys").then(all => {
      if(all){
        this.all_surveys = all;
      }
    });
  }

  fetchSurveys(){
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
          this.all_surveys.push(surv);
        }
      }

      for(i in this.survey_invites_ids){
        surv = this.configService.getSurveyData(this.survey_invites_ids[i]);
        if(surv){
          surv['type'] = '';
          surv['type'] = 'invites';
          this.survey_invites.push(surv);
          this.all_surveys.push(surv);
        }
      }

      this.mySurveys.reverse();
      this.survey_invites.reverse();
      this.all_surveys.reverse();

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

  confirmDeleteSurvey(item){
    var surveyId = item['id'];
    if(this.configService.isConnectedToFirebase()){
      this.configService.deleteSurvey(surveyId);
    }else{
      this.configService.showSimpleConnectionError();
    }

    setTimeout(() => {
      this.ionViewWillEnter();
    }, 1000);
  }

  showDeleteConfirmationAlert(item){
    var msg = 'Are you sure to delete this survey?';
    if(item['type']){
      if(item['type'] == 'mySurvey'){
        console.log("Deleting my survey...");
        msg = 'Are you sure to delete this survey?';
      }else if( item['type'] == 'invites'){
        msg = 'Are you sure to delete this Invitation?';
      }
    }else{
      msg = 'Are you sure to delete this Draft?';
    }

    let alert = this.alertCtrl.create({
      title: 'Warning',
      message: msg,
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked.');
        }
      },
      {
        text: 'Delete',
        handler: () => {
          if(item['type']){
            if(item['type'] == 'mySurvey'){
              console.log("Deleting my survey...");
              this.confirmDeleteSurvey(item);
            }else if( item['type'] == 'invites'){
              console.log("Deleting survey invitations...");
              this.deleteSurveyInvitation(item);
            }
          }else{
            // assume draft item
            console.log("Deleting my drafts...");
            this.deleteDraft(item);
          }
        }
      }
    ]
    });
    alert.present();
  }

  deleteSurveyInvitation(item){
    let loading = this.loadingCtrl.create({
      content: 'Deleting invitation...'
    });

    loading.present().then(() => {
      if(this.configService.isConnectedToFirebase()){
        this.configService.deleteSurveyInvitation(item['id']);
      }else{
        this.configService.showSimpleConnectionError();
      }

      this.ionViewWillEnter();
      loading.dismiss();
    });
  }

  deleteDraft(item){

  }

  showItemOption(item){
    const actionSheet = this.actionSheetController.create({
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.showDeleteConfirmationAlert(item);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    actionSheet.present();
  }

  public ionViewWillEnter() {
    console.log("entering survey-list ...");
    this.surveys = {};

    this.mySurveys = [];
    this.mySurveys_ids = [];

    this.survey_invites = [];
    this.survey_invites_ids = [];

    // mySurveys + survey invites
    this.all_surveys = [];
    this.fetchSurveys();

    // save offline responses from localDB to Firebase
    this.syncResponsesToFirebase();
  }

}
