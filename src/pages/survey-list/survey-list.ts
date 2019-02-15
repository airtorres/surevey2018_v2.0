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
      this.showPrompt('Connection Timeout','You must be connected to the internet.');
    }
  }

  syncResponsesToFirebase(){
    // check for Firebase connection
   var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if(connectedToFirebaseFlag){
      for( var survId in this.offline_responses){
        for( var resp in this.offline_responses[survId]){
          var newUserKey = firebase.database().ref().child('responses/'+survId).push().key;
          var thisResponse = this.offline_responses[survId][resp];
          var successFlag = true;
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
    // check for Firebase connection
    var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

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
            this.all_surveys.push(temp);
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
            this.all_surveys.push(temp);
          }else{
            this.survey_invites_ids.splice(i,1);
          }
        });
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

  showPrompt(thisTitle, msg){
    let alert = this.alertCtrl.create({
      title: thisTitle,
      message: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  confirmDeleteSurvey(item){
    let loading = this.loadingCtrl.create({
      content: 'Deleting survey...'
    });

    loading.present().then(() => {

      firebase.database().ref('/surveys/'+item['id']).remove(
        function(error) {
        if(error){
          console.log("Not able to delete survey on list");
        }else{
          console.log("Survey Deleted on survey List!");
        }
      });

      // deleting all responses for this survey
      firebase.database().ref('/responses/'+item['id']).remove(
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
        if(item['id'] == mySurvs[m]){
          firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/surveylist/'+m).remove(
            function(error) {
              if(error){
                console.log("Not able to delete survey on user_survey");
                thisPrompt.showPrompt('Connection Timeout', 'You must be connected to the Internet.');
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

      this.ionViewWillEnter();
      loading.dismiss();
    });
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
      var thisPrompt = this;
      // deleting survey id from invitations
      firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/invitations/'+item['id']).remove(
        function(error) {
        if(error){
          console.log("Not able to delete invitation.");
        }else{
          console.log("Survey ID from invitation removed!");
          try{
            thisPrompt.configService.displayToast('Invitation Deleted!');
          }catch(e){
            console.log(e);
          }
        }
      });

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
