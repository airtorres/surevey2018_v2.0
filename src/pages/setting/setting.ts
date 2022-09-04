import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { LoginProvider } from '../../providers/login/login';
import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  @ViewChild('currpassword') currpassword;
  @ViewChild('newpassword') newpassword;
  @ViewChild('retypeNew') retypeNew;

  userID = '';

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private fire: AngularFireAuth,
  	public loginService: LoginProvider,
  	public configService: ConfigurationProvider,
  	private storage: Storage) {

  	this.userID = this.fire.auth.currentUser.uid;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingPage');
  }

  updateLocalDB(newPSWD){
  	this.storage.set('currentUserPSWD', newPSWD);
  }

  updatePassword(){
  	var that = this;

  	if(this.newpassword.value.length < 6){
  		this.configService.displayToast('Password must have atleast 6 characters!');
  	}
  	else{
	  	firebase.database().ref('/users/' + this.userID+'/password')
		.once('value', dataSnapshot => {
			var mypswd = dataSnapshot.val();

			var newPSWD = this.loginService.md5(this.newpassword.value);

			if(this.loginService.md5(this.currpassword.value) == mypswd){
				if(this.newpassword.value == this.retypeNew.value){
					firebase.database().ref("/users/"+this.userID+'/password').set(newPSWD, function(error){
			          if(error){
			            console.log("Not successful updating password"+error);
			            that.configService.showSimpleAlert("Update Failed", "Something's wrong while updating the password. Check your internet connection.");
			          }else{
			            console.log("Password updated!");
			            that.configService.showSimpleAlert("Success!", "Password updated.");
			            that.updateLocalDB(newPSWD);
			            that.navCtrl.pop();
			          }
			        });
				}else{
					this.configService.displayToast('New password did not match on retype!');
				}
			}else{
				this.configService.displayToast('Incorrect current password!');
			}
		});
	}
  }

}
