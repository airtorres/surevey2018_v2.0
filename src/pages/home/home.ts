import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SigninPage } from '../signin/signin';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,
  	private fire: AngularFireAuth) {

  }

  logout(){
  	this.fire.auth.signOut().then()
  	.catch( function(error) {
      console.log("got an error:", error);
      
      // only temporary alert. Show error later.
      alert(error.message);
    });

  	// navigate back to sign-in page
  	this.navCtrl.setRoot(SigninPage);
  }

}
