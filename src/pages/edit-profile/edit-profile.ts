import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';

import * as countryStateCity from 'country-state-city';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

/**
 * Generated class for the EditProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-profile',
  templateUrl: 'edit-profile.html',
})
export class EditProfilePage {

  @ViewChild('firstname') firstname;
  @ViewChild('lastname') lastname;
  @ViewChild('username') username;

  userId: string;
  countryName: string;
  stateName: string;
  cityName: string;
  profession : any;
  sex: any;
  bdate: any;
  country: any;
  state: any;
  city: any;
  userData = {};
  countries = [];
  states = [];
  cities = [];

  countryId : string;
  stateId : string;
  cityId : string;


  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private fire: AngularFireAuth,
  	public toastCtrl : ToastController) {

  	this.userId = this.fire.auth.currentUser.uid;
  	this.userData = this.navParams.get('userData');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProfilePage');

    console.log(this.userData);
   

    this.sex = this.userData['sex'];
    this.profession = this.userData['profession'];

    try {
    	if (this.userData['birthdate'] === "" ) {
    		this.bdate = null;
	    }
	    else {
	    	this.bdate = this.userData['birthdate'];
	    }
    } catch (error) { console.log(error); }
    

    try {
    	this.countries = countryStateCity.getAllCountries();
    } catch (error) {
    	console.log(error);
    }

    if (this.userData['country'] != "") {
    	for (var idx in this.countries) {
	    	if (this.userData['country'] == this.countries[idx]['name']) {
	    		this.countryId = this.countries[idx]['id'];
	    		break;
	    	}
	    }
	    this.country = this.countryId;
	    this.countryName = this.countries[this.country-1]['name'];
    } else { 
    	this.country = null; 
    }
    

    if (this.userData['state'] != "") {
    	this.states = countryStateCity.getStatesOfCountry(this.countryId);
    	for (var index in this.states) {
	    	if (this.userData['state'] == this.states[index]['name']) {
	    		this.stateId = this.states[index]['id'];
	    		this.stateName = this.states[index]['name'];
	    		break;
	    	}
	    }
	    this.state = this.stateId;
    } else { 
    	this.states = countryStateCity.getStatesOfCountry(this.countryId);
    	this.state = null; 
    }


    if (this.userData['city'] != "") {
    	this.cities = countryStateCity.getCitiesOfState(this.stateId);
    	for (var cidx in this.cities) {
	    	if (this.userData['city'] == this.cities[cidx]['name']) {
	    		this.cityId = this.cities[cidx]['id'];
	    		this.cityName = this.cities[cidx]['name'];
	    		break;
	    	}
	    }
	    this.city = this.cityId;
    } else { 
    	this.cities = countryStateCity.getCitiesOfState(this.stateId);
    	this.city = null; 
    }
  }

  getCountry() {
  		console.log(this.country);

  		try {
	    	this.states = countryStateCity.getStatesOfCountry(this.country);
	    } catch (error) {
	    	console.log(error);
	    }
  		
  		this.state = null;
  		this.city = null;
  		console.log(this.countries[this.country-1]['name']);
  		this.countryName = this.countries[this.country-1]['name'];
  		this.stateName = "";
  		this.cityName = "";
  	}

  	getState() {
  		console.log(this.state);

  		try {
	    	this.cities = countryStateCity.getCitiesOfState(this.state);
	    } catch (error) {
	    	console.log(error);
	    }
	    
	    for (var idx in this.states) {
	    	if (this.state == this.states[idx]['id']) {
	    		console.log(this.states[idx]['name']);
	    		this.stateName = this.states[idx]['name'];
	    		break;
	    	}
	    }
	    this.city = null;
	    this.cityName = "";
  	}

  	getCity() {
  		console.log(this.city);
  		// console.log(this.cities);
  		for (var idx in this.cities) {
  			if (this.city == this.cities[idx]['id']) {
  				console.log(this.cities[idx]['name']);
  				this.cityName =this.cities[idx]['name'];
  				break;
  			}
  		}	
  	}

	saveProfile() {

		var today = new Date();
		var todayYear = today.getFullYear();
		var todayMonth = today.getMonth()+1;
		var todayDay = today.getDate();
		var bday = new Date(this.bdate);
		var age = todayYear - bday.getFullYear();

		if (todayMonth < bday.getMonth() - 1) {
            age--;
        }

        if (bday.getMonth() - 1 === todayMonth && todayDay < bday.getDate()) {
            age--;
        }

		  		
		firebase.database().ref('/users/'+ this.userId + '/first_name/').set(this.firstname.value);
   		firebase.database().ref('/users/'+ this.userId + '/last_name/').set(this.lastname.value);
   		firebase.database().ref('/users/'+ this.userId + '/username/').set(this.username.value);

   		if (this.profession != undefined) {
   			firebase.database().ref('/users/'+ this.userId + '/profession/').set(this.profession);
   		}

   		if (this.sex != undefined) {
   			firebase.database().ref('/users/'+ this.userId + '/sex/').set(this.sex);
   		}

   		if (this.bdate != null) {
   			firebase.database().ref('/users/'+ this.userId + '/birthdate/').set(this.bdate);
   			firebase.database().ref('/users/' + this.userId + '/age/').set(age);
   		}
   		
   		if (this.countryName != null) {
   			firebase.database().ref('/users/' + this.userId + '/country/').set(this.countryName);
   		}
   		
   		if (this.stateName != null) {
   			firebase.database().ref('/users/' + this.userId + '/state/').set(this.stateName);
   		}
   		
   		if (this.cityName != null) {
   			firebase.database().ref('/users/' + this.userId + '/city/').set(this.cityName);
   		}

   		// -----------------------------------------------------

  		if (this.countryName != "" && this.stateName == "" && this.cityName == "") {
			firebase.database().ref('/users/' + this.userId + '/location/').set(this.countryName);
  		}

  		else if (this.countryName != "" && this.stateName != "" && this.cityName == "") {
  			firebase.database().ref('/users/' + this.userId + '/location/').set(this.stateName + ", " + this.countryName);
  		}

  		else if (this.countryName != "" && this.stateName != "" && this.cityName != "") {
   			firebase.database().ref('/users/' + this.userId + '/location/').set(this.cityName + ", " + this.stateName + ", " + this.countryName);
   		}
   		else{
   			firebase.database().ref('/users/' + this.userId + '/location/').set("");
   		}

	    let toast = this.toastCtrl.create({
	      message: 'Success! Profile Updated!',
	      duration: 2000,
	      position: 'bottom'
	    });

	    toast.present();

   		this.navCtrl.pop();

	}

}
