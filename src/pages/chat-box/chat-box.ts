import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';

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
  connectedToFirebaseFlag = true;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetController: ActionSheetController,
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider) {

    this.userId = this.fire.auth.currentUser.uid;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatBoxPage');
    this.loadChatMessages();
  }

  loadChatMessages(){
    firebase.database().ref('/chatmates/'+this.userId)
    .on('value', chatmatesSnapshot => {
      var allChatmates = chatmatesSnapshot.val();
      console.log(allChatmates);
      this.chatmatelist = [];
      if (allChatmates){
        for (var id in allChatmates){
          console.log(allChatmates[id]);
          this.chatmatelist.push(allChatmates[id]);
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

  showSubmitError(){
    console.log("ERROR");
  }

  updateIsSeen() {
    var that = this;
    firebase.database().ref("/notifications/"+this.fire.auth.currentUser.uid+"/chatNotifs/")
    .once('value', chatNotifSnap => {
      var chatNotif = chatNotifSnap.val();

      for (var cn in chatNotif) {
        firebase.database().ref("/notifications/"+this.fire.auth.currentUser.uid+"/chatNotifs/"+cn+"/isSeen").set("true", function(error){
          if(error){
            console.log("Not successful updating isSeen to True."+error);
            that.showSubmitError();
          }else{
            console.log("Successfully updated: isSeen to True");
          }
        });
      }
    });
  }

  markAsRead(id){
    // use the chatmate id as the id on the html
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
    this.updateIsSeen();

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
