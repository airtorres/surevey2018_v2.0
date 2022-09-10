import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

import { EditProfilePage } from "../edit-profile/edit-profile";

import { ConfigurationProvider } from "../../providers/configuration/configuration";

import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import "firebase/database";

@IonicPage()
@Component({
  selector: "page-profile",
  templateUrl: "profile.html",
})
export class ProfilePage {
  userData = {};
  address = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public configService: ConfigurationProvider,
    private fire: AngularFireAuth
  ) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProfilePage");

    if (this.configService.isConnectedToFirebase()) {
      firebase
        .database()
        .ref("/users/" + this.fire.auth.currentUser.uid)
        .on("value", (dataSnapshot) => {
          this.userData = dataSnapshot.val();
        });
    } else {
      this.userData = this.configService.getUserDataFromLocalDB();
    }

    this.address = this.getAddress();
  }

  getAddress() {
    const country = this.userData["country"] ? this.userData["country"] : "";
    let state = this.userData["state"] ? this.userData["state"] : "";
    let city = this.userData["city"] ? this.userData["city"] : "";

    if (city != "") {
      city = city + ", ";
    }
    if (state != "") {
      state = state + ", ";
    }

    return city + state + country;
  }

  gotoEditProfile() {
    if (this.configService.isConnectedToFirebase()) {
      this.navCtrl.push(EditProfilePage, { userData: this.userData });
    } else {
      this.configService.showSimpleConnectionError();
    }
  }

  public ionViewWillEnter() {
    this.address = this.getAddress();
  }
}
