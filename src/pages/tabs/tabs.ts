import { Component } from "@angular/core";

import { HomePage } from "../home/home";
import { SurveyListPage } from "../survey-list/survey-list";
import { NotificationPage } from "../notification/notification";
import { ChatBoxPage } from "../chat-box/chat-box";

import { ConfigurationProvider } from "../../providers/configuration/configuration";

import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import "firebase/database";

@Component({
  templateUrl: "tabs.html",
})
export class TabsPage {
  tab1Root = HomePage;
  tab2Root = SurveyListPage;
  tab3Root = NotificationPage;
  tab4Root = ChatBoxPage;

  userID;
  public notifBadgeCount = 0;
  public notifBadge;
  userNotifs = [];

  conversationIDs = [];
  chatmates = [];
  userChats = [];
  public chatBadgeCount = 0;

  constructor(
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider
  ) {
    this.userID = this.fire.auth.currentUser.uid;
    this.checkChildAdded();
  }

  checkChildAdded() {
    const allUserNotifRef: firebase.database.Reference = firebase
      .database()
      .ref("/notifications/" + this.userID + "/surveyNotifs");
    allUserNotifRef.on("value", (allUserNotifSnapshot) => {
      const notif = allUserNotifSnapshot.val();
      this.userNotifs = [];
      this.notifBadgeCount = 0;
      for (const i in notif) {
        this.userNotifs.push(notif[i]);
      }
      console.log(this.userNotifs);
      for (const n in this.userNotifs) {
        if (this.userNotifs[n]["isSeen"] == false) {
          this.notifBadgeCount++;
        }
      }
    });

    const allUserChatNotif: firebase.database.Reference = firebase
      .database()
      .ref("/notifications/" + this.userID + "/chatNotifs/");
    allUserChatNotif.on("value", (allUserChatNotifSnap) => {
      const chatnotif = allUserChatNotifSnap.val();
      console.log(chatnotif);
      this.chatBadgeCount = 0;
      for (const c in chatnotif) {
        if (chatnotif[c]["isSeen"] == false) {
          this.chatBadgeCount++;
        }
      }
    });
  }
}
