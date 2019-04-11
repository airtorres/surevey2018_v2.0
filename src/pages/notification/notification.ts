import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController,ActionSheetController,LoadingController } from 'ionic-angular';

import { AnswerSurveyPage } from '../answer-survey/answer-survey';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the NotificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html',
})
export class NotificationPage {
  currUser;
  userID;

  surveys = [];
  public user_survey_invites = [];
  public allSurveyInvi = [];
  public user_notif = [];
  public allUserNotif = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetController: ActionSheetController,
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    private storage: Storage,
    private fire: AngularFireAuth,
    private configService: ConfigurationProvider) {
    
    this.storage.get('currentUser').then(x => {
      this.currUser = x;
    });
    this.userID = this.fire.auth.currentUser.uid;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NotificationPage');
    this.fetchNotifFromFirebase();
  }

  ionViewDidEnter() {
    this.updateIsSeen();
  }

  fetchNotifFromFirebase() {
    firebase.database().ref('/notifications/'+this.userID+'/surveyNotifs').orderByChild('timestamp').on('value', allUserNotifRef => {
      this.user_notif = allUserNotifRef.val();

      this.allUserNotif=[];
      for (var i in this.user_notif) {
        this.allUserNotif.push(this.user_notif[i]);
      }
      this.allUserNotif.reverse();
    });
  }

  showSubmitError(){
    console.log("ERROR");
  }


  updateIsSeen() {
    var that = this;
    const userNotifIsSeenRef:firebase.database.Reference = firebase.database().ref('/notifications/'+this.userID+'/surveyNotifs');
    userNotifIsSeenRef.on('value', allUserNotifSnap => {
      var notif = allUserNotifSnap.val();
      for (var n in notif) {
        firebase.database().ref("/notifications/"+this.fire.auth.currentUser.uid+"/surveyNotifs/"+n+"/isSeen").set("true", function(error){
          if(error){
            console.log("Not successful updating isSeen to True."+error);
            that.showSubmitError();
          }else{
            console.log("Successfully updated: isSeen to True");
          }
        });
      }

    });
  }

  showItemOption(notif){
    const actionSheet = this.actionSheetController.create({
      cssClass: 'action-sheets-basic-page',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.showDeleteConfirmationAlert(notif);
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

  updateIsSeenStatusToTrue(surveyID){
    try{
      var that = this;
      firebase.database().ref("/notifications/"+this.fire.auth.currentUser.uid+"/"+surveyID+"/isSeen").set("true", function(error){
        if(error){
          console.log("Not successful updating isSeen to True."+error);
          that.showSubmitError();
        }else{
          console.log("Successfully updated: isSeen to True");
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  answerInvi(survey) {
    // check for Firebase connection
    var surveyID = survey['s_id'];
    var item = this.configService.getSurveyData(surveyID);

    var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();
    if(connectedToFirebaseFlag && survey['s_status'] != 'completed'){
      this.updateIsSeenStatusToTrue(surveyID);
      this.navCtrl.push(AnswerSurveyPage, {'item' : item, 'viewOnly': false});
    }else if(survey['s_status'] != 'completed'){
      this.configService.showSimpleConnectionError();
    }
  }

  deleteInvi(survey) {
    let alert = this.alertCtrl.create({
      title: 'Warning',
      message: 'Are you sure to delete this invitation?',
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
          console.log(survey['s_id']);
          this.configService.deleteSurveyInvitation(survey['s_id']);
          this.deleteNotification(survey)
        }
      }
    ]
    });
    alert.present();
  }

  showDeleteConfirmationAlert(notif){
    var msg = 'Are you sure to delete this notification?';

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
          this.deleteNotification(notif);
        }
      }
    ]
    });
    alert.present();
  }

  deleteNotification(notif) {
    let loading = this.loadingCtrl.create({
      content: 'Deleting survey...'
    });


    loading.present().then(() => {
      if (notif['type'] == 'invitation') {
        firebase.database().ref("/notifications/"+this.fire.auth.currentUser.uid+"/surveyNotifs/"+notif['s_id']).remove(
        function(error) {
          if(error){
            console.log("Not able to delete notifications.");
            loading.dismiss();
          }else{
            console.log("Notification deleted!");
            loading.dismiss();
          }
        });
      }

      else if (notif['type'] == 'respond') {
        firebase.database().ref("/notifications/"+this.fire.auth.currentUser.uid+"/"+notif['s_respondent_id']).remove(
        function(error) {
          if(error){
            console.log("Not able to delete notifications.");
            loading.dismiss();
          }else{
            console.log("Notification deleted!");
            loading.dismiss();
          }
        });
      }
    });
  }
}
