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
  public badgeCount:number = 0;
  userNotifs = [];

  constructor(private fire: AngularFireAuth, public configService: ConfigurationProvider) {

    this.userID = this.fire.auth.currentUser.uid;
    this.checkChildAdded();
  }

  checkChildAdded() {
    const allUserNotifRef:firebase.database.Reference = firebase.database().ref('/notifications/'+this.userID);
    allUserNotifRef.on('value', allUserNotifSnapshot => {
      var notif = allUserNotifSnapshot.val();
      // console.log(notif);
      // if (notif['isSeen'] == false) {
      //   this.badgeCount ++;
      // }
      this.userNotifs = [];
      this.badgeCount = 0;
      for (var i in notif) {
        this.userNotifs.push(notif[i]);
      }
      console.log(notif);

      for (var n in this.userNotifs) {
        if (this.userNotifs[n]['isSeen'] == false) {
          this.badgeCount++;
        }
        else {
          this.badgeCount = 0;
        }
      }
    });


  }
  
}
