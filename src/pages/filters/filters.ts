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
  // public numPersons;
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
    var connectFlag = this.configService.isConnectedToFirebase();

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

    this.state = "Anywhere";
    this.city = "Anywhere";
	}

	getState() {
		console.log(this.state);

    this.cities = this.configService.getCitiesOf(this.state, this.country);
    console.log(this.cities);

    this.city = "Anywhere";
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
      duration: 3100,
      position: 'bottom'
    });

    applyFilter.present();
  }

  randomSample() {
    let length = 0;

    if (this.all_users_email.length <= this.numPersons.value) {
      this.navCtrl.getPrevious().data.generated_users = this.all_users_email;
    }
    else {
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
    }
    this.navCtrl.getPrevious().data.numPersons = this.numPersons;
    this.applyFilterToast();
    this.navCtrl.pop();
  }

  cluster_stratifiedSample() {
    console.log("cluster");
    this.all_users_email = [];
    let filteredUsers = [];
    filteredUsers = this.all_users;
    let arrayofUsers = [];

    let ageMin = this.min.value;
    let ageMax = this.max.value;
    let sex = this.sex;
    let profession = this.profession;
    let country = this.country;
    let state = this.state;
    let city = this.city;

    // retrieve sample with ageMin only
    if (ageMin != '' && ageMax == '') {
      console.log("ageMin");
      arrayofUsers = [];
      for ( var e in filteredUsers){
        if(filteredUsers[e]['age'] >= ageMin){
          console.log(filteredUsers[e]['age'], filteredUsers[e]['email']);
          arrayofUsers.push(filteredUsers[e]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    // retrieve sample with ageMax only
    if (ageMin == '' && ageMax != '') {
      console.log("ageMax");
      arrayofUsers = [];
      for ( var m in filteredUsers){
        if(filteredUsers[m]['age'] <= ageMax && filteredUsers[m]['age'] >= 15){
          console.log(filteredUsers[m]['age'], filteredUsers[m]['email']);
          arrayofUsers.push(filteredUsers[m]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    // retrieve sample with ageMin and ageMax only
    if (ageMin != '' && ageMax != '') {
      console.log("ageMin and ageMax");
      arrayofUsers = [];
      for ( var mn in filteredUsers){
        if(filteredUsers[mn]['age'] >= ageMin && filteredUsers[mn]['age'] <= ageMax){
          console.log(filteredUsers[mn]['age'], filteredUsers[mn]['email']);
          arrayofUsers.push(filteredUsers[mn]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    // retrieve sample with given sex only
    if (sex != 'Male & Female') {
      console.log("sex: ", sex);
      arrayofUsers = [];
      for ( var s in filteredUsers){
        if(filteredUsers[s]['sex'] == sex){
          console.log(filteredUsers[s]['sex'], filteredUsers[s]['email']);
          arrayofUsers.push(filteredUsers[s]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    // retrieve sample with given profession only
    if (profession != 'Any') {
      console.log("profession: ", profession);
      arrayofUsers = [];
      for ( var p in filteredUsers){
        if(filteredUsers[p]['profession'] == profession){
          console.log(filteredUsers[p]['profession'], filteredUsers[p]['email']);
          arrayofUsers.push(filteredUsers[p]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    // retrieve sample with given country, state, and city
    if (country != 'Anywhere' && state == 'Anywhere' && city == 'Anywhere') {
      console.log("country");
      arrayofUsers = [];
      for ( var c in filteredUsers){
        if(filteredUsers[c]['country'] == country){
          console.log(filteredUsers[c]['country'], filteredUsers[c]['email']);
          arrayofUsers.push(filteredUsers[c]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    if (country != 'Anywhere' && state != 'Anywhere' && city == 'Anywhere') {
      console.log("country, state");
      arrayofUsers = [];
      for ( var st in filteredUsers){
        if(filteredUsers[st]['country'] == country && filteredUsers[st]['state'] == state){
          console.log(filteredUsers[st]['country'], filteredUsers[st]['state'], filteredUsers[st]['email']);
          arrayofUsers.push(filteredUsers[st]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    if (country != 'Anywhere' && state != 'Anywhere' && city != 'Anywhere') {
      console.log("country, state, city");
      arrayofUsers = [];
      for ( var ci in filteredUsers){
        if(filteredUsers[ci]['country'] == country && filteredUsers[ci]['state'] == state && filteredUsers[ci]['city'] == city){
          console.log(filteredUsers[ci]['country'],  filteredUsers[ci]['state'],filteredUsers[ci]['city'], filteredUsers[ci]['email']);
          arrayofUsers.push(filteredUsers[ci]);
        }
      }
      filteredUsers = [];
      filteredUsers = arrayofUsers;
    }

    // get all emails after filtering from filterdUsers array
    for (var user in filteredUsers) {
        this.all_users_email.push(filteredUsers[user]['email']);
    }

    this.randomSample();
  }

  requiredField() {
    let incompleteFieldsToast = this.toastCtrl.create({
      message: 'Please input the number of respondents to be generated.',
      duration: 2000,
      position: 'bottom'
    });

    incompleteFieldsToast.present();
    this.numPersons.setFocus();
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
    if (this.numPersons.value == '') { 
      this.requiredField();
    }
    else {
       // for random sampling
      if (this.min.value == '' && this.max.value == '' && this.sex == 'Male & Female' && this.profession == 'Any' && this.country == 'Anywhere' && this.state == 'Anywhere' && this.city == 'Anywhere') {
        let generateUsersByRandom = this.loadingCtrl.create({
          content: '\nGenerating users... Please wait'
        });

        generateUsersByRandom.present().then(() => {
          this.randomSample();
          generateUsersByRandom.dismiss();
        });
      }   
      else {
        // cluster or stratified sampling
        let generateUsersByClusterStratified = this.loadingCtrl.create({
          content: '\nApplying filters... Generating users... Please wait'
        });

        generateUsersByClusterStratified.present().then(() => {
          this.cluster_stratifiedSample();
          generateUsersByClusterStratified.dismiss();
        });
      }
    }
  }

	cancelBtn() {
		this.navCtrl.pop();
	}

}
