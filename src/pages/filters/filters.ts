import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';
import { Storage } from '@ionic/storage';
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
  @ViewChild('numPersons') numPersons;
  profession: any;
  sex: any;
  country: any;
  state: any;
  city: any;
  minimum: string;
  maximum: string;
  countries = [];
  states = [];
  cities = [];

  all_users = [];
  all_users_email = [];
  public generated_users = [];
  currUser;
  connectedToFirebaseFlag;

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	public toastCtrl: ToastController, private storage: Storage,
    private fire: AngularFireAuth,
    public configService: ConfigurationProvider,
    public loadingCtrl: LoadingController) {

  	this.connectedToFirebaseFlag = this.configService.isConnectedToFirebase();
    if (this.connectedToFirebaseFlag) {
      this.countries = this.configService.getAllCountryNames();
      console.log(this.countries);
    }

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
      this.configService.showSimpleConnectionError();
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

    console.log(this.all_users_email);
  }

	getCountry() {
		console.log(this.country);

    this.states = this.configService.getStateNamesOf(this.country);
    console.log(this.states);

    this.state = "";
    this.city = "";
	}

	getState() {
		console.log(this.state);

    this.cities = this.configService.getCitiesOf(this.state, this.country);
    console.log(this.cities);

    this.city = "";
	}

	getCity() {
		console.log(this.city);
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

  applyFilterToast() {
    let applyFilter = this.toastCtrl.create({
      message: 'Applied filters successfully!',
      duration: 2000,
      position: 'bottom'
    });

    applyFilter.present();
  }

  randomSample() {
    console.log("im here");
    let length = 0;
    while (length != this.numPersons.value) {
      let user = this.all_users_email[Math.floor(Math.random()*this.all_users_email.length)];

      if (this.generated_users.indexOf(user) !== -1) {
        console.log('user exists');
        continue;
      } else {
        this.generated_users.push(user);
        length++;
      }
    }
    console.log(this.generated_users);
    this.navCtrl.getPrevious().data.generated_users = this.generated_users;
    this.navCtrl.pop();
  }

	applyFilter() {
		console.log("Applying filter....");
		console.log("min: ", this.min.value);
		console.log("max: ", this.max.value);
		console.log(this.sex);
		console.log(this.profession);
		console.log(this.country);
		console.log(this.state);
		console.log(this.city);
    console.log("Num Persons: ", this.numPersons.value);

    // if empty ang number of respondents
    if (this.min.value == '' && this.max.value == '' && this.sex == 'Male & Female' && this.profession == 'Any' && this.country == 'Anywhere' && this.state == 'Anywhere' && this.city == 'Anywhere' && this.numPersons.value == '') { 
      let incompleteFieldsToast = this.toastCtrl.create({
        message: 'Please input the number of respondents to be generated.',
        duration: 2000,
        position: 'bottom'
      });

      incompleteFieldsToast.present();
      this.numPersons.setFocus();
    }

    // for random sampling
    if (this.min.value == '' && this.max.value == '' && this.sex == 'Male & Female' && this.profession == 'Any' && this.country == 'Anywhere' && this.state == 'Anywhere' && this.city == 'Anywhere' && this.numPersons.value != '') {
      this.randomSample();
    }

    // console.log(this.generated_users);
    // this.applyFilterToast();

    // this.navCtrl.getPrevious().data.generated_users_email = this.generated_users;
    // this.navCtrl.pop();
	}

	cancelBtn() {
		this.navCtrl.pop();
	}

}
