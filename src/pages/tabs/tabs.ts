import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { SurveyListPage } from '../survey-list/survey-list';
import { NotificationPage } from '../notification/notification';
import { ChatBoxPage } from '../chat-box/chat-box';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = SurveyListPage;
  tab3Root = NotificationPage;
  tab4Root = ChatBoxPage;

  userID;
  public notifBadgeCount:number = 0;
  public notifBadge;
  userNotifs = [];

  conversationIDs = [];
  chatmates = [];
  userChats = [];
  public chatBadgeCount:number = 0;

  constructor(private fire: AngularFireAuth, public configService: ConfigurationProvider) {

    this.userID = this.fire.auth.currentUser.uid;
    this.checkChildAdded();
  }

  checkChildAdded() {
    const allUserNotifRef:firebase.database.Reference = firebase.database().ref('/notifications/'+this.userID+'/surveyNotifs');
    allUserNotifRef.on('value', allUserNotifSnapshot => {
      var notif = allUserNotifSnapshot.val();
      this.userNotifs = [];
      this.notifBadgeCount = 0;
      for (var i in notif) {
        this.userNotifs.push(notif[i]);
      }
      console.log(this.userNotifs);
      for (var n in this.userNotifs) {
        if (this.userNotifs[n]['isSeen'] == false) {
          this.notifBadgeCount++;
        }
      }
    });

    const allUserChatNotif:firebase.database.Reference = firebase.database().ref('/notifications/'+this.userID+'/chatNotifs/');
    allUserChatNotif.on('value', allUserChatNotifSnap => {
      var chatnotif = allUserChatNotifSnap.val();
      console.log(chatnotif);
      this.chatBadgeCount = 0;
      for (var c in chatnotif) {
        if (chatnotif[c]['isSeen'] == false) {
          this.chatBadgeCount++; 
        }
      }
    });

    // const chatmatesRef:firebase.database.Reference = firebase.database().ref('/chatmates/'+this.userID);
    // chatmatesRef.on('value', userChatmatesSnap => {
    //   var mates = userChatmatesSnap.val();

    //   this.chatmates = [];
    //   for (var j in mates) {
    //     this.chatmates.push(mates[j])
    //   }
    //   for (var chatmate in this.chatmates) {
    //     if (this.chatmates[chatmate] < this.userID){
    //       // this.conversationId = this.chatmates[chatmate]+this.userID;
    //       this.conversationIDs.push(this.chatmates[chatmate]+this.userID);
    //     }else{
    //       // this.conversationId = this.userID+this.chatmates[chatmate];
    //       this.conversationIDs.push(this.userID+this.chatmates[chatmate]);
    //     }
    //   }
    //   // console.log(this.conversationIDs);
    //   this.checkChats(this.conversationIDs);
    // });
    
  }

  // checkChats(convoID) {
  //   console.log("convoID:",convoID);
  //   for (var id in convoID) {
  //     firebase.database().ref('/chat_messages/'+convoID[id]+'/isSeen/').on('value', chatMsgSnap => {
  //       var isSeen = chatMsgSnap.val();

  //       if (isSeen == false) {
  //         this.chatBadgeCount++;
  //       }
  //       else {
  //         this.chatBadgeCount = 0;
  //       }
  //     });
  //   }
    
  // }
  
}
