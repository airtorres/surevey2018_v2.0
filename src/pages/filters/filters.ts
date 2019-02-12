import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

import countryStateCity from 'country-state-city';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';
/**
 * Generated class for the FiltersPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filters',
  templateUrl: 'filters.html',
})
export class FiltersPage {
  
  @ViewChild('min') min;
  @ViewChild('max') max;
  profession: any;
  sex: any;
  country: any;
  state: any;
  city: any;
  minimum: string;
  maximum: string;
  countryName: "";
  stateName: "";
  cityName: "";
  countries = [];
  states = [];
  cities = [];

  all_users = [];
  currUser;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	public toastCtrl: ToastController,
    private fire: AngularFireAuth) {

  	this.countries = countryStateCity.getAllCountries();

  	this.sex = "Male & Female";
  	this.profession = "Any";
  	this.country = "Anywhere";
  	this.state = "Anywhere";
  	this.city = "Anywhere";

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    this.checkConnection();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FiltersPage');
  }

  checkConnection(){
    // check for Firebase connection
    var connectFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Getting data from Firebase...");
          connectFlag = true;          
        }else {
          console.log("Error loading data from Firebase.");
          connectFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

    if(connectFlag){
      this.loadUsersFromFirebase();
    }
    else{
      this.showInternetConnectionError();
    }
  }

  loadUsersFromFirebase(){
    // getting all users from firebase
    const allUsersRef:firebase.database.Reference = firebase.database().ref('/users/');
    allUsersRef.on('value', allUsersSnapshot => {
      this.all_users = allUsersSnapshot.val();
    });

    // getting the emails of all_users
    for ( var e in this.all_users){
      if(this.all_users[e]['email'] != this.fire.auth.currentUser.email){
        this.all_users_email.push(this.all_users[e]['email']);
      }
    }
  }

	getCountry() {
		console.log(this.country);
		this.states = countryStateCity.getStatesOfCountry(this.country);
		this.state = "Anywhere";
		this.countryName = this.countries[this.country-1]['name'];
	}

	getState() {
		console.log(this.state);
		this.cities = countryStateCity.getCitiesOfState(this.state);
		for (var idx in this.states) {
    	if (this.state == this.states[idx]['id']) {
    		console.log(this.states[idx]['name']);
    		this.stateName = this.states[idx]['name'];
    		break;
    	}
    }
	}

	getCity() {
		for (var idx in this.cities) {
			if (this.city == this.cities[idx]['id']) {
				console.log(this.cities[idx]['name']);
				this.cityName =this.cities[idx]['name'];
				break;
			}
		}
	}

	reset() {
		this.minimum = "";
		this.maximum = "";
		this.sex = "Male & Female";
  	this.profession = "Any";
  	this.country = "Anywhere";
  	this.state = "Anywhere";
  	this.city = "Anywhere";
	}

	applyFilter() {
		console.log("Applying filter....");
		console.log("min: ", this.min.value);
		console.log("max: ", this.max.value);
		console.log(this.sex);
		console.log(this.profession);
		console.log(this.country, this.countryName);
		console.log(this.state, this.stateName);
		console.log(this.city, this.cityName);

		let applyFilter = this.toastCtrl.create({
      message: 'Applied filters successfully!',
      duration: 2000,
      position: 'bottom'
    });

    applyFilter.present();

 		this.navCtrl.pop();
	}

	cancelBtn() {
		this.navCtrl.pop();
	}

}
