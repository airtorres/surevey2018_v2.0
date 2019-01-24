import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ProfilePage } from '../profile/profile';
import { SettingPage } from '../setting/setting';
import { TemplateListPage } from '../template-list/template-list';

import { AngularFireAuth } from '@angular/fire/auth';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  currentUser;
  built_in_templates = {};

  constructor(public navCtrl: NavController,
  	private fire: AngularFireAuth,
  	public app: App,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currentUser = x;
    });
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
      
      // only temporary alert. Show error later.
      alert(error.message);
    });

  	// navigate back to sign-in page
  	this.navCtrl.popToRoot();
  	this.app.getRootNav().setRoot(SigninPage);
  }

  create_survey(){
  	this.navCtrl.push(CreateSurveyPage, {});
  }

  browse_templates(){
    this.navCtrl.push(TemplateListPage, {})
  }

}