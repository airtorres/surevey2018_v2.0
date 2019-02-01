import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { FiltersPage } from '../filters/filters';

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

  public s_id;
  thisSurvey = {
    'id':'',
  	's_id':'',
  	'status':'pending' //status: cancelled/deleted/pending/incomplete/completed
  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private storage: Storage,
    private fire: AngularFireAuth,
  	private alertCtrl: AlertController) {
  	this.s_id = this.navParams.get('s_id');

    // getting all users from firebase
    try{
      const allUsersRef:firebase.database.Reference = firebase.database().ref('/users/');
      allUsersRef.on('value', allUsersSnapshot => {
        this.all_users = allUsersSnapshot.val();
      });
    }catch(e){
      console.log(e);
      this.showInternetConnectionError();
    }

  	this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    // getting the emails of all_users
    for ( var e in this.all_users){
      if(this.all_users[e]['email'] != this.fire.auth.currentUser.email){
        this.all_users_email.push(this.all_users[e]['email']);
      }
    }
  }

  ionViewWillEnter(){
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendInvitePage');
  }

  showInternetConnectionError(){
    let alert = this.alertCtrl.create({
      title: 'Oppss! Connection Timeout.',
      message: 'You must be connected to the internet.',
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
  }

  sendInvitation(){
    console.log(this.selected_users);

    var thisUser = {};
    try{
      const userToSurveyRef:firebase.database.Reference = firebase.database().ref("/user_surveys/");
      userToSurveyRef.on('value', userToSurveySnapshot => {
        thisUser = userToSurveySnapshot.val();
      });
    }catch(e){
      console.log(e);
      this.showInternetConnectionError();
    }

    // getting all the users
    for(var s in this.selected_users){
      for(var u in thisUser){
        console.log(this.selected_users[s])
        console.log(thisUser[u]['email']);
        if(thisUser[u]['email'] == this.selected_users[s]){
          console.log("Sending invitation to "+thisUser[u]['email']+"...");

          var newPostKey = firebase.database().ref().child('surveys').push().key;
          this.thisSurvey['id'] = newPostKey;

          // if(thisUser[u]['invitations']){
          //   // thisUser[u]['email'] = this.currUser;
          //   firebase.database().ref("/user_surveys/"+u+"/invitations/"+newPostKey).set(this.thisSurvey);
          // }
          // else{
          //   firebase.database().ref("/user_surveys/"+u).set({
          //     'email': this.currUser,
          //     'invitations':[]
          //   });
          //   // thisUser[u]['email'] = this.currUser;
          //   firebase.database().ref("/user_surveys/"+u+"/invitations/"+newPostKey).set(this.thisSurvey);
          // }
          console.log("-------------");
          break;
        }
        console.log("+++++++++");
      }
    }

  	// for ( var u in this.selected_users){
  	// 	if (this.selected_users[u] == true){
  	// 		for ( var i in this.users['users']){
  	// 			if (this.users['users'][i]['email'] == u){
		 //    		this.thisSurvey['s_id'] = this.s_id;
		 //    		this.users['users'][i]['invitations'].push(this.thisSurvey);
		 //    		break;
		 //    	}
  	// 		}
  	// 	}
  	// }

  	// this.storage.set('users', this.users).then((data) => {
   //  	console.log("Sending invite ...");
   //  });

    // let alert = this.alertCtrl.create({
    //   title: 'Success',
    //   message: 'Your invitations are successfully sent.',
    //   buttons: ['OK']
    // });
    // alert.present();

  	this.navCtrl.pop();
  }

  gotoFiltersPage() {
     this.navCtrl.push(FiltersPage);
  }

}
