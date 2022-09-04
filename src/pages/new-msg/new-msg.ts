import { Component, ViewChild } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

/**
 * Generated class for the NewMsgPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-new-msg",
  templateUrl: "new-msg.html",
})
export class NewMsgPage {
  @ViewChild("receiver") receiver;
  chatmate;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.chatmate = navParams.get("chatmate");
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad NewMsgPage");
  }
}
