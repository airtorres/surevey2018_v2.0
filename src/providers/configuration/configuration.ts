import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ToastController, AlertController } from 'ionic-angular';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Storage } from '@ionic/storage';

/*
  Generated class for the ConfigurationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigurationProvider {

  built_in_templates = [];

  constructor(public http: HttpClient,
  	private fire: AngularFireAuth,
  	private storage: Storage,
  	public toastCtrl : ToastController,
  	private alertCtrl: AlertController) {

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

  showSimpleConnectionError(){
    let alert = this.alertCtrl.create({
      title: 'Connection Timeout',
      message: 'You must be connected to the internet.',
      buttons: ['OK']
    });
    alert.present();
  }

  transformAuthorName(authorId, email){
    var name = email;
    const user:firebase.database.Reference = firebase.database().ref('/users/'+authorId);
    user.on('value', userSnapshot => {
      var u = userSnapshot.val();

      if(u){
        var firstname = u['first_name'];
        var lastname = u['last_name'];

        if(u['first_name'] != null && u['last_name'] != null){
          name = firstname + ' ' + lastname;
        }
      }
    });

    if(name == ' '){
      name = email;
    }

    return name;
  }

  transformDate(isoDate){
    var date = new Date(isoDate);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    var month = months[date.getMonth()];
    var day = date.getDate();
    var year = date.getFullYear();

    var dateVal = month + ' '+ day + ', ' + year;

    if (dateVal){
      return dateVal;
    }
    else{
      return "No Date Specified";
    }
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

  saveUsernameFromFirebaseToLocalDB(){
  	if(this.isConnectedToFirebase()){
  	  const uname:firebase.database.Reference = firebase.database().ref('/users/'+this.fire.auth.currentUser.uid);
      uname.on('value', userSnapshot => {
        this.storage.set('username', userSnapshot.val()['username']);
      });
  	}
  }

  getBuiltInTemplatesFromLocalDB(){
  	try{
	  	this.storage.get('built_in_templates').then(templates =>{
	      this.built_in_templates = templates;
	    });
	}catch(e){
		console.log(e);
	}
  }

  getBuiltInTemplates(){
  	if(this.isConnectedToFirebase()){
  	  const templateRef:firebase.database.Reference = firebase.database().ref('/built_in_templates');
      templateRef.on('value', templateSnapshot => {
        this.built_in_templates = [];
        var tempRef = templateSnapshot.val();
        for ( var temp in tempRef){
          this.built_in_templates.push(tempRef[temp]);
        }
        this.storage.set('built_in_templates', this.built_in_templates);
      });
  	}
  	else{
  		this.getBuiltInTemplatesFromLocalDB();
  	}
    return this.built_in_templates;
  }

}
