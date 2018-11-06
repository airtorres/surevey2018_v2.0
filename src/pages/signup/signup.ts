import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SigninPage } from '../signin/signin';
import { WelcomePage } from '../welcome/welcome';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';

import { Storage } from '@ionic/storage';

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

  // for firebaseDB
  arrayUsers = []

  // for local storage
  users = {}
  user = {
    'username':'',
    'first name': '',
    'last name': '',
    'age':'',
    'birthdate': '',
    'address': '',
    'sex':'',
    'gender':'',
    'email': '',
    'password':'',
    'surveys':[],
    'invitations': []
  }


  constructor(public navCtrl: NavController, public navParams: NavParams, private formbuilder: FormBuilder,
    private fire: AngularFireAuth,
    private fireDB: AngularFireDatabase,
    private storage: Storage) {

    this.storage.get("users").then(value => {
        this.users = value;
    });

    let EMAILPATTERN = /^[a-z0-9][a-z0-9!#$%&'*+\/=?^_`{|}~.-]*\@[a-z0-9]+\.[a-z0-9]+(\.[a-z0-9]+)*$/i;
    let USERNAMEPATTERN = /^[a-z]+[a-z0-9!#$%&'*+\/=?^_`{|}~.-]*/i;
    this.authSignup = formbuilder.group({
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

    // PARA SA ANO JA? UPDATE? -------------------------------------------------
    // this.fireDB.list("/users/").valueChanges().subscribe(_data => {
    //   this.arrayUsers = _data;
    //   console.log(this.arrayUsers);
    // });

    // SIGNING UP TO FIREBASE AUTH -----------------------------------------
    // this.fire.auth.createUserWithEmailAndPassword(this.email.value, this.password.value)
    // .then(data => {
    //   console.log("Data got:\n", data);
    //   this.navigateToHome();
    // })
    // .catch( function(error) {
    //   console.log("got an error:", error);
    //   // only temporary alert. Show error later.
    //   alert(error.message);
    // });

    // SIGNING UP TO IONIC LOCAL STORAGE --------------------------------------
    this.user['username'] = this.username.value;
    this.user['email'] = this.email.value;
    this.user['password'] = this.password.value;

    if(this.users){
      JSON.parse(this.users['users'].push(this.user));
    }
    else{
      this.users = {'users': ''};
      this.users['users'] = [this.user];
    }
    this.storage.set('users', this.users);
    this.storage.set('currentUser', this.email.value);
    this.navigateToHome();
    // ENDOF SIGNUP-LOCAL -----------------------------------------------------

  }

  navigateToHome(){
  	this.navCtrl.setRoot(WelcomePage);
  }

}
