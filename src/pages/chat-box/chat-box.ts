import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';

import { ChatPage } from '../chat/chat';
import { NewMsgPage } from '../new-msg/new-msg';

import * as firebase from 'firebase/app';
import 'firebase/database';

import { AngularFireAuth } from '@angular/fire/auth';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

@IonicPage()
@Component({
  selector: 'page-chat-box',
  templateUrl: 'chat-box.html',
})
export class ChatBoxPage {

  chatmatelist = [];
  chatmateNames = {};
  userId;
  connectedToFirebaseFlag = true;

  isReadDict = {}

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetController: ActionSheetController,
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider) {

    this.userId = this.fire.auth.currentUser.uid;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatBoxPage');

    var that = this;
    firebase.database().ref('/chatmates/'+this.userId)
    .on('value', chatmatesSnapshot => {
      var allChatmates = chatmatesSnapshot.val();
      console.log(allChatmates);
      this.chatmatelist = [];
      if (allChatmates){
        for (var id in allChatmates){
          console.log(allChatmates[id]);
          this.chatmatelist.push(allChatmates[id]);

          var convoId = this.getConvoId(this.userId, allChatmates[id]);

          firebase.database().ref("/notifications/"+that.userId+"/chatNotifs/"+convoId+"/isSeen")
          .on('value', readSnapshot => {
            var isRead = readSnapshot.val();
            that.isReadDict[allChatmates[id]] = isRead;
          });
        }
      }
    });
  }

  getChatmateName(cid){
    var name = this.configService.transformAuthorNameNoEmail(cid);
    this.chatmateNames[cid] = '';
    this.chatmateNames[cid] = name;
    return name;
  }

  getConvoId(uid1, uid2){
    if (uid1 < uid2){
      return uid1+uid2;
    }else{
      return uid2+uid1;
    }
  }

  getLatestMessageForDisplay(chatmateId){
    var convoId = this.getConvoId(chatmateId, this.userId);
    var last = '';
    firebase.database().ref('/chat_messages/'+ convoId).orderByChild('date_sent')
    .on('value', chatSnapshot => {
      var allMsg = chatSnapshot.val();
      if (allMsg){
        var msg = [];
        for (var m in allMsg){
          msg.push(allMsg[m]['content']);
        }
          last = msg[msg.length-1];
        }
    });
    return last;
  }

  markAsRead(chatmateId){
    this.isReadDict[chatmateId] = true;

    var convoId = this.getConvoId(this.userId, chatmateId);
    firebase.database().ref("/notifications/"+this.userId+"/chatNotifs/"+convoId+"/isSeen").set(true, function(error){
      if(error){
        console.log(error);
      }
    });
  }

  gotoChat(chatmateId){
    this.markAsRead(chatmateId);
  	this.navCtrl.push(ChatPage, {'chatmate' : this.chatmateNames[chatmateId]? this.chatmateNames[chatmateId]:'','author_id': chatmateId, 'uid':this.userId});
  }

  gotoNewMsg(){
    this.navCtrl.push(NewMsgPage, {});
  }

  ionViewDidEnter(){
    // check for Firebase connection
    this.connectedToFirebaseFlag = this.configService.connectedToFirebaseFlag;
    console.log("ionviewdidenter chatbox");

    if(!this.connectedToFirebaseFlag){
      this.configService.displayToast('Cannot load messages. No Internet Connection.');
    }
  }

  delChatCopy(chatmateId){
    var that = this;
    firebase.database().ref("/chatmates/"+this.fire.auth.currentUser.uid+"/"+chatmateId).remove(
    function(error) {
      if(error){
        console.log(error);
        that.configService.displayToast("Error occured. Try again.");
      }else{
        that.configService.displayToast("Conversation deleted!");
      }
    });
  }

  showItemOption(chatmateId){
    const actionSheet = this.actionSheetController.create({
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.delChatCopy(chatmateId);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    actionSheet.present();
  }

}
