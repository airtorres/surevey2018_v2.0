import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ToastController,
  LoadingController,
} from "ionic-angular";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";

import { SignupPage } from "../signup/signup";
import { MyAppPage } from "../my-app/my-app";

import { LoginProvider } from "../../providers/login/login";
import { ConfigurationProvider } from "../../providers/configuration/configuration";

import { AngularFireAuth } from "@angular/fire/auth";

import { Storage } from "@ionic/storage";

@IonicPage()
@Component({
  selector: "page-signin",
  templateUrl: "signin.html",
})
export class SigninPage {
  authSignin: FormGroup;
  @ViewChild("email") email;
  @ViewChild("password") password;

  usr;
  pswd;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public toastCtrl: ToastController,
    private formbuilder: FormBuilder,
    public loginService: LoginProvider,
    public configService: ConfigurationProvider,
    public loadingCtrl: LoadingController,
    private fire: AngularFireAuth,
    private storage: Storage
  ) {
    this.configService.isConnectedToFirebase();

    // used for offline login
    try {
      this.storage.get("currentUser").then((currUser) => {
        this.usr = currUser;
      });
      this.storage.get("currentUserPSWD").then((cuurrpswd) => {
        this.pswd = cuurrpswd;
      });
    } catch (e) {
      console.log("Error logging in using localDB");
    }

    const EMAILPATTERN =
      /^[a-z0-9][a-z0-9!#$%&'*+\/=?^_`{|}~.-]*\@[a-z0-9]+\.[a-z0-9]+(\.[a-z0-9]+)*$/i;

    this.authSignin = this.formbuilder.group({
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
    console.log("ionViewDidLoad SigninPage");
  }

  navigateToSignUp() {
    this.navCtrl.setRoot(SignupPage);
  }

  navigateToHome() {
    this.navCtrl.setRoot(MyAppPage);
  }

  showInvalidLogin() {
    try {
      // document.getElementById('invalidLogin_div').style.display = "block";
      const invalidLogin = this.toastCtrl.create({
        message: "Email and password does not match!",
        duration: 2000,
        position: "bottom",
      });

      invalidLogin.present();
    } catch (e) {}
  }

  logInUsingLocalStorage() {
    if (
      this.usr == this.email.value &&
      this.pswd == this.loginService.md5(this.password.value)
    ) {
      this.navigateToHome();
    } else {
      this.showInvalidLogin();
    }
  }

  signin() {
    const loading = this.loadingCtrl.create({
      content: "Signing in",
    });

    loading.present().then(() => {
      try {
        this.fire.auth
          .signInWithEmailAndPassword(this.email.value, this.password.value)
          .then((data) => {
            console.log("Data got:\n", data);

            try {
              document.getElementById("invalidLogin_div").style.display =
                "none";
            } catch (e) {}

            // for offline login
            this.storage.set("currentUser", this.email.value);
            this.storage.set(
              "currentUserPSWD",
              this.loginService.md5(this.password.value)
            );

            loading.dismiss();
            this.navigateToHome();
          })
          .catch((error) => {
            console.log("got an error:", error);
            loading.dismiss();
            if (error.code == "auth/network-request-failed") {
              this.logInUsingLocalStorage();
            } else if (
              error.code == "auth/wrong-password" ||
              error.code == "auth/user-not-found" ||
              error.code == "auth/invalid-email"
            ) {
              this.showInvalidLogin();
            }
          });
      } catch (e) {
        loading.dismiss();
        this.logInUsingLocalStorage();
      }
    });
  }
}
