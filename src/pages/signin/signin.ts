import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SignupPage } from '../signup/signup';
import { WelcomePage } from '../welcome/welcome';
import { AngularFireAuth } from '@angular/fire/auth';

/**
 * Generated class for the SigninPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {

  @ViewChild('email') email;
  @ViewChild('password') password;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fire: AngularFireAuth) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SigninPage');
  }

  navigateToSignUp(){
  	this.navCtrl.setRoot(SignupPage);
  }

  navigateToHome(){
  	this.navCtrl.setRoot(WelcomePage);
  }

  signin(){
    this.fire.auth.signInWithEmailAndPassword(this.email.value, this.password.value)
    .then(data => {
      console.log("Data got:\n", data);
      this.navigateToHome();
    })
    .catch( function(error) {
      console.log("got an error:", error);
      // only temporary alert. Show error later.
      alert(error.message);
    });
  }

}
