import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ToastController } from 'ionic-angular';

import * as firebase from 'firebase/app';
import 'firebase/database';

/*
  Generated class for the ConfigurationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigurationProvider {

  constructor(public http: HttpClient,
  	public toastCtrl : ToastController) {
    console.log('Hello ConfigurationProvider Provider');
  }

  displayToast(msg){
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });

    toast.present();
  }

  isConnectedToFirebase(){
  	// check for Firebase connection
  	console.log("checking for connection...");
    var connectedToFirebaseFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Connected to Firebase.");
          connectedToFirebaseFlag = true;          
        }else {
          console.log("Error connecting to Firebase.");
          connectedToFirebaseFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

    return connectedToFirebaseFlag;
  }

}
