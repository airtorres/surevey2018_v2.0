import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ChatPage } from '../chat/chat';
import { NewMsgPage } from '../new-msg/new-msg';

import * as firebase from 'firebase/app';
import 'firebase/database';

import { AngularFireAuth } from '@angular/fire/auth';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

/**
 * Generated class for the ChatBoxPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-chat-box',
  templateUrl: 'chat-box.html',
})
export class ChatBoxPage {

  chatmatelist = [];
  chatmateNames = {};
  userId;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider) {

    this.userId = this.fire.auth.currentUser.uid;
    this.loadChatMessages();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatBoxPage');
  }

  loadChatMessages(){
    firebase.database().ref('/chatmates/'+this.userId)
    .on('value', chatmatesSnapshot => {
      var allChatmates = chatmatesSnapshot.val();
      if (allChatmates){
        this.chatmatelist = [];
        for (var id in allChatmates){
          this.chatmatelist.push(allChatmates[id]);
          var mate = {
            'name': this.getChatmateName(allChatmates[id]),
            'id': allChatmates[id],
            'isRead': false
          };

          this.chatmateNames[id] = '';
          this.chatmateNames[id] = mate;
        }
      }

      console.log(this.chatmateNames);
    });
  }

  getChatmateName(cid){
    return this.configService.transformAuthorNameNoEmail(cid);
  }

  markAsRead(id){
    // use the chatmate id as the id on the html
  }

  gotoChat(chatmateId){
    this.markAsRead(chatmateId);
  	this.navCtrl.push(ChatPage, {'chatmate' : this.chatmateNames[chatmateId]['name'],'author_id': chatmateId, 'uid':this.userId});
  }

  gotoNewMsg(){
    this.navCtrl.push(NewMsgPage, {});
  }

}
