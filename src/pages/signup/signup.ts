import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  AlertController,
} from "ionic-angular";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { SigninPage } from "../signin/signin";
import { WelcomePage } from "../welcome/welcome";
import { AngularFireAuth } from "@angular/fire/auth";

import { LoginProvider } from "../../providers/login/login";
import { ConfigurationProvider } from "../../providers/configuration/configuration";

import * as firebase from "firebase/app";
import "firebase/database";
import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: "page-signup",
  templateUrl: "signup.html",
})
export class SignupPage {
  authSignup: FormGroup;
  @ViewChild("username") username;
  @ViewChild("email") email;
  @ViewChild("password") password;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formbuilder: FormBuilder,
    public loginService: LoginProvider,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    public configService: ConfigurationProvider,
    private storage: Storage,
    private fire: AngularFireAuth
  ) {
    let EMAILPATTERN =
      /^[a-z0-9][a-z0-9!#$%&'*+\/=?^_`{|}~.-]*\@[a-z0-9]+\.[a-z0-9]+(\.[a-z0-9]+)*$/i;
    let USERNAMEPATTERN = /^[a-z]+[a-z0-9!#$%&'*+\/=?^_`{|}~.-]*/i;
    this.authSignup = this.formbuilder.group({
      username: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(USERNAMEPATTERN),
        ]),
      ],
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(EMAILPATTERN),
        ]),
      ],
      password: [
        "",
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SignupPage");
  }

  navigateToSignIn() {
    this.navCtrl.setRoot(SigninPage);
  }

  showAgreementPage() {
    let alertAgree = this.alertCtrl.create({
      title: "Terms and Conditions",
      message:
        "By signing up, you agree to share your basic info and the details and information that you used on this application to the administrators, the Surevey Team.",
      cssClass: "agreeAlert",
      buttons: [
        {
          text: "Yes, I agree",
          cssClass: "agreeBtn",
          handler: () => {
            this.signup();
          },
        },
      ],
    });
    alertAgree.present();
  }

  signup() {
    console.log(this.email.value);
    let loading = this.loadingCtrl.create({
      content: "Signing up",
    });

    var that = this;

    loading.present().then(() => {
      // SIGNING UP TO FIREBASE -----------------------------------------
      this.fire.auth
        .createUserWithEmailAndPassword(this.email.value, this.password.value)
        .then((data) => {
          console.log("Data got:\n", data);
          var id;
          try {
            id = this.fire.auth.currentUser.uid;
          } catch (e) {
            console.log(e);
          }

          var hashPassword = this.loginService.md5(this.password.value);

          var user = {
            username: this.username.value,
            email: this.email.value,
            password: hashPassword,
            first_name: "",
            last_name: "",
            profession: "",
            birthdate: "",
            gender: "",
            sex: "",
            age: "",
            country: "",
            city: "",
            state: "",
          };

          var user_survey = {
            email: this.email.value,
            surveys: [],
            invitations: [],
          };

          try {
            firebase
              .database()
              .ref("/users/" + id)
              .set(user)
              .then(() => {});
            firebase
              .database()
              .ref("/user_surveys/" + id)
              .set(user_survey);

            // for offline login
            this.storage.set("currentUser", this.email.value);
            this.storage.set(
              "currentUserPSWD",
              this.loginService.md5(this.password.value)
            );
            this.storage.set("username", this.username.value);

            loading.dismiss();
            this.navigateToHome();
          } catch (error) {
            loading.dismiss();
            console.log("got an error:", error);
            that.configService.displayToast(
              "Unable to signup. Connection failed! Try again later."
            );
          }
        })
        .catch(function (error) {
          loading.dismiss();
          console.log("got an error:", error);

          if (error.code == "auth/email-already-in-use") {
            that.configService.showSimpleAlert(
              "Failed",
              "The email is already in use. Try different email."
            );
          } else {
            that.configService.showSimpleAlert(
              "Failed",
              "Please contact the developer for unexpected errors."
            );
          }
        });
    });
  }

  navigateToHome() {
    this.navCtrl.setRoot(WelcomePage);
  }
}
