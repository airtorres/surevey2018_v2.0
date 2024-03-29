import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
} from "ionic-angular";

import * as firebase from "firebase/app";
import "firebase/database";

import { ConfigurationProvider } from "../../providers/configuration/configuration";

@IonicPage()
@Component({
  selector: "page-chat",
  templateUrl: "chat.html",
})
export class ChatPage {
  @ViewChild("content") content;
  @ViewChild("chatMessage") chatMessage;
  chatmate = "(Missing Receiver Info)";
  conversationId;
  userId;
  authorId;
  allmessages = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    public configService: ConfigurationProvider
  ) {
    this.chatmate = this.navParams.get("chatmate")
      ? this.navParams.get("chatmate")
      : "(Missing Receiver Info)";
    this.authorId = this.navParams.get("author_id");
    this.userId = this.navParams.get("uid")
      ? this.navParams.get("uid")
      : "(Missing Receiver Info)";

    if (this.authorId < this.userId) {
      this.conversationId = this.authorId + this.userId;
    } else {
      this.conversationId = this.userId + this.authorId;
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad ChatPage");

    firebase
      .database()
      .ref("/chat_messages/" + this.conversationId)
      .on("value", (chatSnapshot) => {
        const allMsg = chatSnapshot.val();

        if (allMsg) {
          this.allmessages = [];
          for (const msg in allMsg) {
            this.allmessages.push(allMsg[msg]);
          }
        }
      });
  }

  transformDate(ISOString) {
    return (
      this.configService.transformDate(ISOString) +
      " " +
      this.configService.transformTime(ISOString)
    );
  }

  addToChatmates(authorId) {
    firebase
      .database()
      .ref("/chatmates/" + this.userId + "/" + authorId)
      .set(authorId, function (error) {
        if (error) {
          console.log("Not successful saving chatmate!" + error);
        } else {
          console.log("Chatmate Added!");
        }
      });

    firebase
      .database()
      .ref("/chatmates/" + authorId + "/" + this.userId)
      .set(this.userId, function (error) {
        if (error) {
          console.log("Not successful saving chatmate!" + error);
        } else {
          console.log("Chatmate Added!");
        }
      });
  }

  sendMessage() {
    const newPostKey = this.conversationId;
    const bindSelf = this;
    const message = {
      content: this.chatMessage.value,
      date_sent: new Date().toISOString(),
      sender: this.userId,
      receiver: this.authorId,
    };
    const chatNotif = {
      isSeen: false,
      receiver: this.authorId,
      sender: this.userId,
    };

    firebase
      .database()
      .ref("/chat_messages/")
      .once("value", (chatSnapshot) => {
        const that = this;
        const newMessageKey = firebase
          .database()
          .ref()
          .child(newPostKey)
          .push().key;
        firebase
          .database()
          .ref("/chat_messages/" + newPostKey + "/" + newMessageKey)
          .set(message, function (error) {
            if (error) {
              console.log("Message not sent!" + error);
              this.configService.displayToast("Sending Failed! Try Again.");
            } else {
              firebase
                .database()
                .ref(
                  "notifications/" +
                    bindSelf.authorId +
                    "/chatNotifs/" +
                    newPostKey
                )
                .set(chatNotif);
              console.log("Message sent!!");
              that.chatMessage.value = "";
              that.content.scrollToBottom(500);
            }
          });

        if (!chatSnapshot.hasChild(newPostKey)) {
          this.addToChatmates(this.authorId);
        }
      });
  }

  confirmDeleteChat() {
    const that = this;
    firebase
      .database()
      .ref("/chatmates/" + this.userId + "/" + this.authorId)
      .remove(function (error) {
        if (error) {
          console.log(error);
          that.configService.displayToast("Error occured. Try again.");
        } else {
          that.navCtrl.pop();
          that.configService.displayToast("Conversation deleted!");
        }
      });
  }

  delChatCopy() {
    const mate = this.chatmate ? this.chatmate : "(Missing Receiver Info)";
    const alert = this.alertCtrl.create({
      title: "Are you sure to delete this conversation?",
      message: "Convo with: " + mate,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Delete",
          handler: () => {
            this.confirmDeleteChat();
          },
        },
      ],
    });
    alert.present();
  }

  ionViewDidEnter() {
    console.log("chat page entered.");
    this.content.scrollToBottom(500);
  }
}
