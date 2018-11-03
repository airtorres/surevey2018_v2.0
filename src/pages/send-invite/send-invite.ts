import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the SendInvitePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-send-invite',
  templateUrl: 'send-invite.html',
})
export class SendInvitePage {
  currUser;
  all_users = [];
  all_users_email = [];

  users;

  public selected_users = {};

  public s_id;
  thisSurvey = {
  	's_id':'',
  	'status:':'pending' //status: cancelled/deleted/pending/incomplete/completed
  }

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private storage: Storage,
  	private alertCtrl: AlertController) {
  	this.s_id = navParams.get('s_id');

  	this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

  	this.storage.get("users").then(users => {
  		this.users = users;

  		// getting all users except for self
        for ( var i in users['users']){
	    	if (users['users'][i]['email'] != this.currUser){
	    	  this.all_users.push(users['users'][i]);
	    	  this.all_users_email.push(users['users'][i]['email']);
	    	}
        }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SendInvitePage');
  }

  showAlert(){
  	let alert = this.alertCtrl.create({
  		title: 'Great!',
  		subTitle: 'Your invitations are successfully sent.',
  		buttons: ['OK'],
  		enableBackdropDismiss: false,
  	});
  	alert.present();
  }

  sendInvitation(){
  	console.log(this.users);

  	for ( var u in this.selected_users){
  		if (this.selected_users[u] == true){
  			for ( var i in this.users['users']){
  				if (this.users['users'][i]['email'] == u){
		    		this.thisSurvey['s_id'] = this.s_id;
		    		this.users['users'][i]['invitations'].push(this.thisSurvey);
		    		break;
		    	}
  			}
  		}
  	}

  	this.storage.set('users', this.users).then((data) => {
    	console.log("Sending invite ...");
    });

  	// Edit the alert component later
  	this.showAlert();

  	this.navCtrl.pop();
  }

}
