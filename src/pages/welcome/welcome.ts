import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

import { MyAppPage } from "../my-app/my-app";

/**
 * Generated class for the WelcomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-welcome",
  templateUrl: "welcome.html",
})
export class WelcomePage {
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    console.log("ionViewDidLoad WelcomePage");
  }

  navigateToHome() {
    this.navCtrl.setRoot(MyAppPage);
    // use this.navCtrl.push(PageName, {}); // para may "back" button
  }
}
