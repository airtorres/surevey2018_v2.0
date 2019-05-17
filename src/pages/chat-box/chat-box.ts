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
  messageDisplays = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public actionSheetController: ActionSheetController,
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider) {

    this.userId = this.fire.auth.currentUser.uid;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatBoxPage');

    firebase.database().ref('/chatmates/'+this.userId)
    .on('value', chatmatesSnapshot => {
      var allChatmates = chatmatesSnapshot.val();
      console.log(allChatmates);
      this.chatmatelist = [];
      if (allChatmates){
        for (var id in allChatmates){

          this.chatmatelist.push(allChatmates[id]);

          this.loadMsgDisplays(allChatmates[id]);
          this.getChatmateName(allChatmates[id]);
          this.loadisReadNotifs(allChatmates[id]);
        }
      }
    });
  }

  loadisReadNotifs(chatmateId){
    var convoId = this.getConvoId(this.userId, chatmateId);
    firebase.database().ref("/notifications/"+this.userId+"/chatNotifs/"+convoId+"/isSeen")
    .on('value', readSnapshot => {
      var isRead = readSnapshot.val();
      this.isReadDict[chatmateId] = isRead;
    });
  }

  getChatmateName(cid){
    // var name = this.configService.transformAuthorNameNoEmail(cid);
    var name = '';
    var email = '';
    const user:firebase.database.Reference = firebase.database().ref('/users/'+cid);
    user.on('value', userSnapshot => {
      var u = userSnapshot.val();

      if(u){
        email = u['email'];
        var firstname = u['first_name'];
        var lastname = u['last_name'];

        if(u['first_name'] != null && u['last_name'] != null){
          name = firstname + ' ' + lastname;
        }
      }

      if(name == ' '){
        name = email;
      }

      this.chatmateNames[cid] = '';
      this.chatmateNames[cid] = name;
    });
    return name;
  }

  getConvoId(uid1, uid2){
    if (uid1 < uid2){
      return uid1+uid2;
    }else{
      return uid2+uid1;
    }
  }

  transformDate(ISOString){
    return this.configService.transformDate(ISOString) + " " + this.configService.transformTime(ISOString);
  }

  getLatestMessageForDisplay(chatmateId){
    return this.messageDisplays[chatmateId] ? this.messageDisplays[chatmateId]:'';
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

  loadMsgDisplays(chatmateId){
    var convoId = this.getConvoId(chatmateId, this.userId);
    var last = '';
    firebase.database().ref('/chat_messages/'+ convoId).orderByChild('date_sent')
    .on('value', chatSnapshot => {
      var allMsg = chatSnapshot.val();
      if (allMsg){
        var msg = [];
        for (var m in allMsg){
          msg.push(allMsg[m]);
        }
        last = msg[msg.length-1];
        this.messageDisplays[chatmateId] = {};
        this.messageDisplays[chatmateId]['last_msg'] = '';
        this.messageDisplays[chatmateId]['last_msg'] = last['content'];
        this.messageDisplays[chatmateId]['date'] = '';
        var date = this.transformDate(last['date_sent']).split(' ');
        var fdate = '';
        if(date){
          var formated = (date[0] + ' ' + date[1]).split(',');
          fdate = formated[0];
        }
        this.messageDisplays[chatmateId]['date'] = fdate;
      }
    });
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
