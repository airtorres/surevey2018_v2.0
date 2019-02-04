import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ProfilePage } from '../profile/profile';
import { SettingPage } from '../setting/setting';
import { TemplateListPage } from '../template-list/template-list';

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

  constructor(public navCtrl: NavController,
  	private fire: AngularFireAuth,
  	public app: App,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currentUser = x;
    });

    this.storage.get('username').then(u =>{
      this.username = u;
    });

    this.loadTemplates();
  }

  gotoProfile(){
  	this.navCtrl.push(ProfilePage, {});
  }

  gotoSettings(){
  	this.navCtrl.push(SettingPage, {});
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
}