import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

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
  all_users = [];
  all_users_email = [];

  public selections = {};
  public selected_users = [];
  public generated_users_from_filter = [];

  selAll : boolean = false;
  public length;

  public s_id;
  thisSurvey = {
  	's_id':'',
  	'status':'pending' //status: cancelled/deleted/pending/incomplete/completed
  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private storage: Storage,
    private fire: AngularFireAuth,
  	private alertCtrl: AlertController,
    public configService: ConfigurationProvider) {

  	this.s_id = this.navParams.get('s_id');
    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    // console.log("length:", this.selected_users.length);
    this.length = this.selected_users.length;
    this.checkConnection();
  }

  ionViewWillEnter(){
    this.generated_users_from_filter = this.navParams.get('generated_users') || null;

    if (this.generated_users_from_filter != null) {
      this.all_users_email = this.generated_users_from_filter;
      this.selected_users = [];
      this.selections = {};
      this.selAll = true;
      for (var email in this.all_users_email) {
        this.selections[this.all_users_email[email]] = true;
        this.selected_users.push(this.all_users_email[email]);
      }
    }
  }

  checkConnection(){
    // check for Firebase connection
    var connectFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Getting data from Firebase...");
          connectFlag = true;          
        }else {
          console.log("Error loading data from Firebase.");
          connectFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

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
    console.log(this.selections);
    console.log(this.selected_users);
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
      for (var email in this.all_users_email) {
        this.selections[this.all_users_email[email]] = false;
        this.selected_users = [];
      }
    }
    console.log(this.selected_users.length);
    console.log(this.selected_users);
  }

  sendInvitation(){
    console.log(this.selected_users);

    this.thisSurvey['s_id'] = this.s_id;
    var successFlag = true;

    // getting all the users
    for(var s in this.selected_users){
      for(var u in this.all_users){
        if(this.all_users[u]['email'] == this.selected_users[s]){
          console.log("Sending invitation to "+this.all_users[u]['email']+"...");

          var inviExist = firebase.database().ref("/user_surveys/"+u+"/invitations")? true:false;
          // the survey ID is used as the pushed ID for this invitation
          var newPostKey = this.s_id;

          if(inviExist){
            firebase.database().ref("/user_surveys/"+u+"/invitations/"+newPostKey).set(this.thisSurvey, function(error){
              if(error){
                console.log("Not successful pushing to invitations (for some users ONLY)."+error);
                successFlag = false;
              }else{
                console.log("Successfully added the surveyID to invitations!");
                successFlag = true && successFlag;
              }
            });
          }
          break;
        }
      }
    }

    if(successFlag){
      this.showSuccessPrompt();
    }else{
      this.configService.showSimpleConnectionError();
    }

  	this.navCtrl.pop();
  }

  gotoFiltersPage() {
     this.navCtrl.push(FiltersPage);
  }

}
