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

  isInvalidLogin = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private formbuilder: FormBuilder,
    private fire: AngularFireAuth,
    private storage: Storage) {

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

  signin(){
    // var isInvalid = false;
    try{
      this.fire.auth.signInWithEmailAndPassword(this.email.value, this.password.value)
      .then(data => {
        console.log("Data got:\n", data);

        // for offline login
        this.storage.set('currentUser', this.email.value);
        this.storage.set('currentUserPSWD', this.password.value);

        this.navigateToHome();
      })
      .catch( function(error) {
        console.log("got an error:", error);
      });
    }catch (e){
      var usr = '';
      var pswd = '';
      this.storage.get('currentUser').then( currUser => {
        usr = currUser;
      });
      this.storage.get('currentUserPSWD').then( cuurrpswd => {
        pswd = cuurrpswd;
      });

      if( usr == this.email.value && pswd == this.password.value){
        this.navigateToHome();
      }
      else{
        // isInvalid = true;
        alert(e.message);
      }
    }

    // BAKIT DI GUMAGANA!!! HUAHUAHUA

    // console.log(isInvalid);
    // this.isInvalidLogin = isInvalid;
  }

}
