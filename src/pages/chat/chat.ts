import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import * as firebase from 'firebase/app';
import 'firebase/database';
import { AngularFireAuth } from '@angular/fire/auth';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

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
  @ViewChild('chatMessage') chatMessage;
	chatmate = "(Missing Receiver Info)";
  conversationId;
  userId;
  authorId;
  allmessages = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider) {
  	this.chatmate = this.navParams.get('chatmate')? this.navParams.get('chatmate'):"(Missing Receiver Info)";
    this.authorId = this.navParams.get('author_id');
    this.userId = this.navParams.get('uid')? this.navParams.get('uid'):"(Missing Receiver Info)";

    if (this.authorId < this.userId){
      this.conversationId = this.authorId+this.userId;
    }else{
      this.conversationId = this.userId+this.authorId;
    }
  }

  ionViewDidLoad() {
    this.loadMessages();
    console.log('ionViewDidLoad ChatPage');
  }

  transformDate(ISOString){
    return this.configService.transformDate(ISOString) + " " + this.configService.transformTime(ISOString);
  }

  loadMessages(){
    firebase.database().ref('/chat_messages/'+this.conversationId)
    .on('value', chatSnapshot => {
      var allMsg = chatSnapshot.val();

      if (allMsg){
        this.allmessages = [];
        for (var msg in allMsg){
          this.allmessages.push(allMsg[msg]);
        }
      }
    });
  }

  addToChatmates(authorId){
    firebase.database().ref("/chatmates/"+this.userId+"/"+authorId).set(authorId, function(error){
      if(error){
        console.log("Not successful saving chatmate!"+error);
      }else{
        console.log("Chatmate Added!");
      }
    });

    firebase.database().ref("/chatmates/"+authorId+"/"+this.userId).set(this.userId, function(error){
      if(error){
        console.log("Not successful saving chatmate!"+error);
      }else{
        console.log("Chatmate Added!");
      }
    });
  }

  sendMessage(){
    console.log("Sending to "+this.chatmate);
    console.log(this.authorId);
    console.log("From: "+this.userId)
    console.log("myEmail"+this.fire.auth.currentUser.email)

    var newPostKey = this.conversationId;
    var message = {
      'content' : this.chatMessage.value,
      'date_sent': new Date().toISOString(),
      'sender': this.userId,
      'receiver': this.authorId
    }

    firebase.database().ref('/chat_messages/')
    .once('value', chatSnapshot => {
      
      var that = this;
      var newMessageKey = firebase.database().ref().child(newPostKey).push().key;
      firebase.database().ref("/chat_messages/"+newPostKey+"/"+newMessageKey).set(message, function(error){
        if(error){
          console.log("Message not sent!"+error);
          this.configService.displayToast('Sending Failed! Try Again.');
        }else{
          console.log("Message sent!!");
          that.chatMessage.value = "";
        }
      });

      if (!chatSnapshot.hasChild(newPostKey)){
        this.addToChatmates(this.authorId);
      }
    });
  }
}
