import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';

import { FiltersPage } from '../filters/filters';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the SendInvitePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-send-invite',
  templateUrl: 'send-invite.html',
})
export class SendInvitePage {
  currUser;
  userID;
  all_users = [];
  all_users_email = [];

  og_all_users_email = [];

  public selections = {};
  public selected_users = [];
  public generated_users_from_filter = [];
  public numPersons;

  selAll : boolean = false;
  public length;

  public s_id;
  public author;
  public title;
  thisSurvey = {
  	's_id':'',
    'status':'pending', //status: cancelled/deleted/pending/incomplete/completed
  }
  notification = {
    'type':'invitation',
    's_id':'',
    's_status':'pending',
    's_author':'',
    's_author_id': '',
    's_title':'',
    's_respondent':'',
    'isSeen': false
  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private storage: Storage,
    private fire: AngularFireAuth,
  	private alertCtrl: AlertController, 
    public toastCtrl: ToastController,
    public configService: ConfigurationProvider) {

    this.s_id = this.navParams.get('s_id');
    this.author = this.navParams.get('author');
    this.title = this.navParams.get('title');
    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    // console.log("length:", this.selected_users.length);
    this.length = this.selected_users.length;
    this.userID = this.fire.auth.currentUser.uid;
    this.checkConnection();
  }

  ionViewWillEnter(){
    this.generated_users_from_filter = this.navParams.get('generated_users') || null;
    this.numPersons = this.navParams.get('numPersons') || null;

    if (this.generated_users_from_filter == null && this.numPersons == null) {
      this.generated_users_from_filter = [];
      this.numPersons = 0;
    }
    else if (this.generated_users_from_filter != null && this.numPersons != null) {
      this.selected_users = [];
      this.selections = {};
      this.all_users_email = this.generated_users_from_filter;
      this.selAll = true;

      for (var email in this.all_users_email) {
        this.selections[this.all_users_email[email]] = true;
        this.selected_users.push(this.all_users_email[email]);
      }

      this.numPersons = parseInt(this.numPersons['value']);
    }
    if (this.generated_users_from_filter.length < this.numPersons) {
      let noteNotEnoughGeneratedUsersToast = this.toastCtrl.create({
        message: "There weren't enough users that fit your filter options.",
        duration: 4000,
        showCloseButton: true,
        closeButtonText: 'Close'
      });
      noteNotEnoughGeneratedUsersToast.present();
    }
  }

  checkConnection(){
    // check for Firebase connection
    var connectFlag = this.configService.isConnectedToFirebase();

    if(connectFlag){
      this.loadUsersFromFirebase();
    }
    else{
      this.configService.showSimpleConnectionError();
    }
  }

  loadUsersFromFirebase(){
    // getting all users from firebase
    const allUsersRef:firebase.database.Reference = firebase.database().ref('/users/');
    allUsersRef.on('value', allUsersSnapshot => {
      this.all_users = allUsersSnapshot.val();
    });

    // getting the emails of all_users
    for ( var e in this.all_users){
      if(this.all_users[e]['email'] != this.fire.auth.currentUser.email){
        this.all_users_email.push(this.all_users[e]['email']);
      }
    }

    this.og_all_users_email = this.all_users_email;
  }

  initialize() {
    // getting the emails of all_users
    this.all_users_email = this.og_all_users_email;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendInvitePage');
  }

  showSuccessPrompt(){
    let alert = this.alertCtrl.create({
      title: 'Success',
      message: 'Your invitations are successfully sent.',
      buttons: ['OK']
    });
    alert.present();
  }

  refresh(){
    this.selected_users = [];
    for(var email in this.selections){
      if (this.selections[email] == true){
        this.selected_users.push(email);
      }
    }

    if ( (this.selected_users.length < this.numPersons && this.selAll == true) || (this.selected_users.length < this.all_users_email.length && this.selAll == true) ) {
      this.selAll = false;
    }
    else if ( (this.selected_users.length == this.numPersons) || (this.selected_users.length == this.all_users_email.length) ) {
      this.selAll = true;
    }
    
  }

  selectAllUsers() {
    this.selected_users = [];
    if (this.selAll == true) {
      for (var email in this.all_users_email) {
        this.selections[this.all_users_email[email]] = true;
        this.selected_users.push(this.all_users_email[email]);
      }
    } 
    if (this.selAll == false) {
      for (var user_email in this.all_users_email) {
        this.selections[this.all_users_email[user_email]] = false;
        this.selected_users = [];
      }
    }
  }

  clearSelected(){
    for (var user_email in this.all_users_email) {
      this.selections[this.all_users_email[user_email]] = false;
      this.selected_users = [];
    }
    if (this.selAll == true) {
      this.selAll = false;
    }
    this.all_users_email = this.og_all_users_email;
  }

  sendInvitation(){
    console.log(this.selected_users);
    var bindSelf = this;

    this.thisSurvey['s_id'] = this.s_id;

    this.notification['s_id'] = this.s_id;
    this.notification['s_author'] = this.author;
    this.notification['s_author_id'] = this.userID;
    this.notification['s_title'] = this.title;
    this.notification['date'] = new Date().toISOString();
    var newNotifKey = firebase.database().ref().child('/notifications/'+ u +'/surveyNotifs/').push().key;
    this.notification['notifId'] = newNotifKey;

    var successFlag = true;
    var surveyInvites = [];
    var survey_invites_ids = [];
    var unsent = [];

    for (var s in this.selected_users) {
      for (var u in this.all_users) {

        var survey_id = this.s_id;

        if(this.all_users[u]['email'] == this.selected_users[s]) {
          console.log("Sending invitation to " + this.all_users[u]['email'] + "...");
          
          const allSurveyInvites:firebase.database.Reference = firebase.database().ref('/user_surveys/'+u+'/invitations');
          allSurveyInvites.on('value', allSurveySnapshot => {
            surveyInvites = allSurveySnapshot.val();
          });
          for ( var invit in surveyInvites){
            survey_invites_ids.push(surveyInvites[invit]['s_id']);
          }
          console.log(survey_invites_ids)
          this.notification['s_respondent'] = this.all_users[u]['email'];
          this.notification['s_respondent_id'] = u;

          if (survey_invites_ids.indexOf(survey_id) !== -1) {
            console.log("You're not allowed to send the survey invitation twice");
            unsent.push(this.all_users[u]['email']);
            // successFlag = false;
            // console.log("unsent: ", unsent);
          }
          else {
            firebase.database().ref("/user_surveys/"+u+"/invitations/"+survey_id).set(this.thisSurvey, function(error){
              if(error){
                console.log("Not successful pushing to invitations (for some users ONLY)."+error);
                successFlag = false;
              }else{
                firebase.database().ref('/notifications/'+ u +'/surveyNotifs/' + newNotifKey).set(bindSelf.notification);
                console.log("Successfully added the surveyID to invitations!");
                successFlag = true && successFlag;
              }
            });
          }
          break;
        }
      }
    }

    if (unsent.length > 0) {
      if (unsent.length == 1) {
        let oneUnsent = this.alertCtrl.create({
          title: 'Failed',
          message: 'Your survey invitation was not sent to ' + unsent[0] + '. This user has already received your survey invite.',
          buttons: ['OK']
        });
        oneUnsent.present();
      }
      else {
        let manyUnsent = this.alertCtrl.create({
          title: 'Notice',
          message: 'Failed to send to some users. Users might already have your survey invites.',
          buttons: ['OK']
        });
        manyUnsent.present();
      }
      
    }
    else if (unsent.length == 0) { 
      if(successFlag){
        this.showSuccessPrompt();
      }else{
        this.configService.showSimpleConnectionError();
      }
    }
    // if(successFlag){
    //   this.showSuccessPrompt();
    // }
    else{
      this.configService.showSimpleConnectionError();
    }

  	this.navCtrl.pop();
  }

  gotoFiltersPage() {
     this.navCtrl.push(FiltersPage);
  }

  onInput(ev) {
    // Reset items back to all of the items
    // this.initializeItems();
    this.initialize();

    // set val to the value of the ev target
    var val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.all_users_email = this.all_users_email.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }


}
