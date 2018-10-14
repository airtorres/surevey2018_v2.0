import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { WelcomePage } from '../welcome/welcome';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  navigateToSignIn(){
  	this.navCtrl.setRoot(SigninPage);
  	// use this.navCtrl.push(PageName, {}); // para may "back" button
  }

  navigateToHome(){
  	this.navCtrl.setRoot(WelcomePage);
  }

}
