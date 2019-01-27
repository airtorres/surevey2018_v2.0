import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { SignupPage } from '../signup/signup';
import { MyAppPage } from '../my-app/my-app';
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
  authSignin : FormGroup;
  @ViewChild('email') email;
  @ViewChild('password') password;

  usr;
  pswd;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private formbuilder: FormBuilder,
    private fire: AngularFireAuth,
    private storage: Storage) {

    // used for offline login
    try{
      this.storage.get('currentUser').then( currUser => {
          this.usr = currUser;
      });
      this.storage.get('currentUserPSWD').then( cuurrpswd => {
        this.pswd = cuurrpswd;
      });
    }catch(e){
      console.log("Error logging in using localDB");
    }

    let EMAILPATTERN = /^[a-z0-9][a-z0-9!#$%&'*+\/=?^_`{|}~.-]*\@[a-z0-9]+\.[a-z0-9]+(\.[a-z0-9]+)*$/i;

    this.authSignin = this.formbuilder.group({
      email : ['', Validators.compose([Validators.required, Validators.pattern(EMAILPATTERN)])],
      password : ['', Validators.compose([Validators.required, Validators.minLength(6)]) ]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SigninPage');
  }

  navigateToSignUp(){
  	this.navCtrl.setRoot(SignupPage);
  }

  navigateToHome(){
  	this.navCtrl.setRoot(MyAppPage);
  }

  showInvalidLogin(){
    try{
      document.getElementById('invalidLogin_div').style.display = "block";
    }catch(e){}
  }

  logInUsingLocalStorage(){
    if( this.usr == this.email.value && this.pswd == this.password.value){
      this.navigateToHome();
    }
    else{
      this.showInvalidLogin();
    }
  }

  signin(){
    try{
      this.fire.auth.signInWithEmailAndPassword(this.email.value, this.password.value)
      .then(data => {
        console.log("Data got:\n", data);

        try{
          document.getElementById('invalidLogin_div').style.display = "none";
        }catch(e){}

        // for offline login
        this.storage.set('currentUser', this.email.value);
        this.storage.set('currentUserPSWD', this.password.value);

        this.navigateToHome();
      })
      .catch( (error) => {
        console.log("got an error:", error);
        if (error.code == 'auth/network-request-failed'){
          this.logInUsingLocalStorage();
        }
        else if(error.code == 'auth/wrong-password' || error.code == 'auth/user-not-found' || error.code == 'auth/invalid-email'){
          this.showInvalidLogin();
        }
      });
    }catch (e){
      this.logInUsingLocalStorage();
    }
  }
}
