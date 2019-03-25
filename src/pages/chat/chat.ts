import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the ChatPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
	chatmate = "(Missing Receiver Info)";
  userId;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  	this.chatmate = this.navParams.get('chatmate')? this.navParams.get('chatmate'):"(Missing Receiver Info)";
    this.userId = this.navParams.get('uid')? this.navParams.get('uid'):"(Missing Receiver Info)";
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    console.log(this.chatmate);
  }

  sendMessage(){
    console.log("Sending to "+this.chatmate);
    console.log("From: "+this.userId)
  }
}
