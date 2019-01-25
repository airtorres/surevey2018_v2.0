import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SigninPage } from '../signin/signin';
import { WelcomePage } from '../welcome/welcome';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

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
  authSignup: FormGroup;
  @ViewChild('username') username;
  @ViewChild('email') email;
  @ViewChild('password') password;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private formbuilder: FormBuilder,
    private fire: AngularFireAuth,
    private fireDB: AngularFireDatabase) {

    let EMAILPATTERN = /^[a-z0-9][a-z0-9!#$%&'*+\/=?^_`{|}~.-]*\@[a-z0-9]+\.[a-z0-9]+(\.[a-z0-9]+)*$/i;
    let USERNAMEPATTERN = /^[a-z]+[a-z0-9!#$%&'*+\/=?^_`{|}~.-]*/i;
    this.authSignup = this.formbuilder.group({
      username : ['', Validators.compose([Validators.required, Validators.pattern(USERNAMEPATTERN)])],
      email : ['', Validators.compose([Validators.required, Validators.pattern(EMAILPATTERN)])],
      password : ['', Validators.compose([Validators.required, Validators.minLength(6)]) ]
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SignupPage');
  }

  navigateToSignIn(){
  	this.navCtrl.setRoot(SigninPage);
  }

  signup(){
    console.log(this.email.value);

    // SIGNING UP TO FIREBASE -----------------------------------------
    this.fire.auth.createUserWithEmailAndPassword(this.email.value, this.password.value)
    .then(data => {
      console.log("Data got:\n", data);

      var user = {
        'username': this.username.value,
        'email': this.email.value,
        'password': this.password.value,
        'first_name': '',
        'last_name': '',
        'profession': '',
        'location': '',
        'birthdate': '',
        'gender': '',
        'sex': '',
        'age': ''
      }

      var user_survey = {
        'email': this.email.value,
        'surveys':[],
        'invitations': []
      }

      this.fireDB.list("/users").push(user);
      this.fireDB.list("/user_surveys").push(user_survey);

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
