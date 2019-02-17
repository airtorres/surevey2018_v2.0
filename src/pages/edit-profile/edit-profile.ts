import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

import { File } from '@ionic-native/file';
import { FileChooser } from '@ionic-native/file-chooser';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

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

  profession;
  bdate;
  sex;
  connectedToFirebaseFlag;

  userId: string;
  country: any;
  state: any;
  city: any;

  userData = {};
  countries = [];
  states = [];
  cities = [];

  prev_birthdate = '';
  prev_city = '';
  prev_country = '';
  prev_first_name = '';
  prev_last_name = '';
  prev_profession = '';
  prev_sex = '';
  prev_state = '';
  prev_username = '';

  userCanLeave = false;
  exitFlag = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController,
    private file: File,
    private fileChooser : FileChooser,
  	private fire: AngularFireAuth,
  	public toastCtrl : ToastController,
    public configService: ConfigurationProvider) {

  	this.userId = this.fire.auth.currentUser.uid;
  	this.userData = this.navParams.get('userData');

    this.loadUserData();

    if(this.userData){
      this.prev_first_name = this.userData['first_name'];
      this.prev_last_name = this.userData['last_name'];
      this.prev_username = this.userData['username'];
      this.prev_birthdate = this.userData['birthdate'] == ""? null: this.userData['birthdate'];
      this.prev_sex = this.userData['sex'];
      this.prev_profession = this.userData['profession'];
      this.prev_city = this.userData['city'];
      this.prev_state = this.userData['state'];
      this.prev_country = this.userData['country'];
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EditProfilePage');   
  }

  loadUserData(){
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
    
    this.connectedToFirebaseFlag = this.configService.isConnectedToFirebase();
    if (this.connectedToFirebaseFlag) {
      this.countries = this.configService.getAllCountryNames();
      console.log(this.countries);
    }

    this.country = this.userData['country'];

    this.states = this.configService.getStateNamesOf(this.country);
    this.state = this.userData['state'];

    this.cities = this.configService.getCitiesOf(this.state, this.country);
    this.city = this.userData['city'];

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

  calculateAge(birthdate){
    console.log(birthdate);

    var today = new Date();
    var todayYear = today.getFullYear();
    var todayMonth = today.getMonth()+1;
    var todayDay = today.getDate();
    var bday = new Date(birthdate);

    var age = todayYear - bday.getFullYear();

    if (todayMonth < bday.getMonth() - 1) {
        age--;
    }

    if (bday.getMonth() - 1 === todayMonth && todayDay < bday.getDate()) {
        age--;
    }

    console.log(age);
    return age;
  }

	saveProfile() {
    this.exitFlag = true;

    if(this.configService.isConnectedToFirebase()){
		  		
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
   			firebase.database().ref('/users/' + this.userId + '/age/').set(this.calculateAge(this.bdate));
   		}

      firebase.database().ref('/users/' + this.userId + '/country/').set(this.country);
      firebase.database().ref('/users/' + this.userId + '/state/').set(this.state);
      firebase.database().ref('/users/' + this.userId + '/city/').set(this.city);

      this.configService.displayToast('Success! Profile Updated!');
    }
    else{
      this.configService.showSimpleConnectionError();
    }
    this.navCtrl.pop();
	}

  // check if there are changes made before leaving the page
  checkAllChanges() {
    if (this.prev_first_name == this.firstname.value && this.prev_last_name == this.lastname.value 
      && this.prev_username == this.username.value && this.prev_profession == this.profession && this.prev_sex == this.sex 
      && this.prev_birthdate == this.bdate && this.prev_country == this.country && this.prev_state == this.state 
      && this.prev_city == this.state) {

      console.log("NO CHANGES MADE.");
      this.userCanLeave = true;
    } else {
      console.log("THERE ARE UNSAVED CHANGES.");
      this.userCanLeave = false;
    }

    // TEMPORARY: WHILE WALA PA NAFIX ANG BUG ABOVE================================
    this.userCanLeave = true;

  }


  ionViewCanLeave() {
    this.checkAllChanges();

    if (!this.userCanLeave && !this.exitFlag) {
      return new Promise((resolve, reject) => {
        let alert = this.alertCtrl.create({
          title: 'Changes made',
          message: 'Do you want to save these changes?',
          buttons: [
            {
              text: "Don't Save",
              handler: () => {
                console.log("User didn't saved data");
                this.userCanLeave = true;
                resolve();
              }
            },
            {
              text: 'Save',
              handler: () => {
                console.log('User saved data');
                // do saving logic
                this.saveProfile();
                this.userCanLeave = true;
                resolve();
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                console.log('User stayed');
                this.userCanLeave = false;
                reject();
              }
            },
          ]
        });
        alert.present();
      });
    }else if(this.exitFlag){
      this.exitFlag = false;
      this.userCanLeave = false;
      return true;
    }
    else { return true; }

  }

  choose() {
    this.fileChooser.open().then((uri)=>{
      alert(uri);

      this.file.resolveLocalFilesystemUrl(uri).then((newUrl)=>{
        alert(JSON.stringify(newUrl));

        let dirPath = newUrl.nativeURL;
        let dirPathSegments = dirPath.split('/');  //break the string into an array
        dirPathSegments.pop();  //remove its last element
        dirPath = dirPathSegments.join('/');

        this.file.readAsArrayBuffer(dirPath, newUrl.name).then(async (buffer)=>{
          await this.upload(buffer, newUrl.name);
        });

      });

    });
  }

  async upload(buffer, name) {
    let blob = new Blob([buffer], { type: "image/jpeg" });

    let storage = firebase.storage();
    storage.ref('images/' + name).put(blob).then((d)=>{
      alert("Done!");
    }).catch((error)=>{
      alert(JSON.stringify(error));
    });
  }

  public ionViewWillEnter(){
    this.loadUserData();
  }

}
