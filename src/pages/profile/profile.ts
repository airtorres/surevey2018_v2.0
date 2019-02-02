import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { EditProfilePage } from '../edit-profile/edit-profile';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  @ViewChild('firstname') firstname;
  @ViewChild('lastname') lastname;
  @ViewChild('username') username;
  userId: string;
  userData = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private fire: AngularFireAuth) {

  	this.userId = this.fire.auth.currentUser.uid;

  	const data:firebase.database.Reference = firebase.database().ref('/users/' + this.userId);
    data.on('value', dataSnapshot => {
    	this.userData = dataSnapshot.val();
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  gotoEditProfile() {
    console.log(this.userData);
	this.navCtrl.push(EditProfilePage, {'userData' : this.userData});
  }

}
