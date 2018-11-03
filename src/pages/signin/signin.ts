import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SignupPage } from '../signup/signup';
import { WelcomePage } from '../welcome/welcome';
import { AngularFireAuth } from '@angular/fire/auth';

import { Storage } from '@ionic/storage';

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
    private fire: AngularFireAuth,
    private storage: Storage) {
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
    // GIN-COMMENT PARA NO NEED MUNA MAGLOGIN
    // this.fire.auth.signInWithEmailAndPassword(this.email.value, this.password.value)
    // .then(data => {
    //   console.log("Data got:\n", data);
    //   this.navigateToHome();
    // })
    // .catch( function(error) {
    //   console.log("got an error:", error);
    //   // only temporary alert. Show error later.
    //   alert(error.message);
    // });

    // TEMP: ALLOWING ALL LOGINS AND SAVE CURRENT USER -----------------------------------------------------
    if (this.email.value){
      // Checking all users
      this.storage.get('users').then((val) => {
        for ( var i in val['users']){
          if (val['users'][i]['email'] == this.email.value && val['users'][i]['password'] == this.password.value){
            this.storage.set('currentUser', this.email.value);
            this.navigateToHome();
            return
          }
        }

        // if no valid users that match
        alert("Not a valid user!");
      });
    }
    else{
      alert("Error Login!");
    }

    // TEMP: currentUser from local: uncomment for auto-login
    // this.navigateToHome();
  }

}
