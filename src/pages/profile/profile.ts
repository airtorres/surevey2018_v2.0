import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { EditProfilePage } from '../edit-profile/edit-profile';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

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

  userData = {};
  address = '';

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public configService: ConfigurationProvider,
  	private fire: AngularFireAuth) {

    if(this.configService.isConnectedToFirebase()){
      this.userData = this.configService.getUserData(this.fire.auth.currentUser.uid);
    }
    else{
      this.userData = this.configService.getUserDataFromLocalDB();
    }
    this.address = this.getAddress();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProfilePage');
  }

  getAddress(){
    var country = this.userData['country']? this.userData['country']:'';
    var state = this.userData['state']? this.userData['state']:'';
    var city = this.userData['city']? this.userData['city']:'';

    if(city != ''){
      city = city + ', ';
    }
    if(state != ''){
      state = state + ', ';
    }

    return city + state + country;
  }

  gotoEditProfile() {
	  this.navCtrl.push(EditProfilePage, {'userData' : this.userData});
  }

  public ionViewWillEnter(){
    if(this.configService.isConnectedToFirebase()){
      this.userData = this.configService.getUserData(this.fire.auth.currentUser.uid);
    }
    else{
      this.userData = this.configService.getUserDataFromLocalDB();
    }
    this.address = this.getAddress();
  }

}
