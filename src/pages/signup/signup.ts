import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { SigninPage } from '../signin/signin';
import { WelcomePage } from '../welcome/welcome';
import { AngularFireAuth } from '@angular/fire/auth';

import { LoginProvider } from '../../providers/login/login';

import * as firebase from 'firebase/app';
import 'firebase/database'
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

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private formbuilder: FormBuilder,
    public loginService: LoginProvider,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    private fire: AngularFireAuth) {

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
    let loading = this.loadingCtrl.create({
      content: 'Signing up...'
    });

    loading.present().then(() => {
      // SIGNING UP TO FIREBASE -----------------------------------------
      this.fire.auth.createUserWithEmailAndPassword(this.email.value, this.password.value)
      .then(data => {
        console.log("Data got:\n", data);
        var id;
        try{
          id = this.fire.auth.currentUser.uid;
        }catch(e){
          console.log(e);
        }

        var hashPassword = this.loginService.md5(this.password.value);

        var user = {
          'username': this.username.value,
          'email': this.email.value,
          'password': hashPassword,
          'first_name': '',
          'last_name': '',
          'profession': '',
          'birthdate': '',
          'gender': '',
          'sex': '',
          'age': '',
          'country': '',
          'city': '',
          'state': ''
        }

        var user_survey = {
          'email': this.email.value,
          'surveys':[],
          'invitations': []
        }

        try{
          firebase.database().ref("/users/"+id).set(user).then( ()=>{});
          firebase.database().ref("/user_surveys/"+id).set(user_survey);

          // for offline login
          this.storage.set('currentUser', this.email.value);
          this.storage.set('currentUserPSWD', this.loginService.md5(this.password.value));
          this.storage.set('username', this.username.value);

          loading.dismiss();
          this.navigateToHome();
        }catch(error){
          loading.dismiss();
          console.log("got an error:", error);
          document.getElementById('unAbleSignup_div').style.display = "block";
        }
      })
      .catch( function(error) {
        loading.dismiss();
        console.log("got an error:", error);
        document.getElementById('unAbleSignup_div').style.display = "block";
      });
    });
  }

  navigateToHome(){
  	this.navCtrl.setRoot(WelcomePage);
  }

}
