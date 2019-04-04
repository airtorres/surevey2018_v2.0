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

  public badgeCount:number = 0;

  constructor(private fire: AngularFireAuth, public configService: ConfigurationProvider) {
    this.checkChildAdded();
  }

  checkChildAdded() {
    const allUserNotifRef:firebase.database.Reference = firebase.database().ref('/notifications/'+this.userID);
    allUserNotifRef.on('child_added', allUserNotifSnapshot => {
      this.badgeCount ++;
    });


  }
  
}
