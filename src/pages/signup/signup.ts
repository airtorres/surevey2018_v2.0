import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { WelcomePage } from '../welcome/welcome';
import { AngularFireAuth } from '@angular/fire/auth';

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

  @ViewChild('username') username;
  @ViewChild('email') email;
  @ViewChild('password') password;


  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fire: AngularFireAuth) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  navigateToSignIn(){
  	this.navCtrl.setRoot(SigninPage);
  	// use this.navCtrl.push(PageName, {}); // para may "back" button
  }

  signup(){
    console.log(this.email.value)
    console.log(this.password.value);
    this.fire.auth.createUserWithEmailAndPassword(this.email.value, this.password.value)
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

  navigateToHome(){
  	this.navCtrl.setRoot(WelcomePage);
  }

}
