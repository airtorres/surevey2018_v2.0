import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ToastController, AlertController, LoadingController } from 'ionic-angular';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Storage } from '@ionic/storage';

/*
  Generated class for the ConfigurationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigurationProvider {

  built_in_templates = [];
  userData = {};
  connectedToFirebaseFlag = false;

  constructor(public http: HttpClient,
  	private fire: AngularFireAuth,
  	private storage: Storage,
  	public toastCtrl : ToastController,
  	public loadingCtrl: LoadingController,
  	private alertCtrl: AlertController) {

    console.log('Hello ConfigurationProvider Provider');
  }

  displayToast(msg){
    let toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: 'bottom'
    });

    toast.present();
  }

  showSimpleConnectionError(){
    let alert = this.alertCtrl.create({
      title: 'Connection Timeout',
      message: 'You must be connected to the internet.',
      buttons: ['OK']
    });
    alert.present();
  }

  transformAuthorName(authorId, email){
    var name = email;
    const user:firebase.database.Reference = firebase.database().ref('/users/'+authorId);
    user.on('value', userSnapshot => {
      var u = userSnapshot.val();

      if(u){
        var firstname = u['first_name'];
        var lastname = u['last_name'];

        if(u['first_name'] != null && u['last_name'] != null){
          name = firstname + ' ' + lastname;
        }
      }
    });

    if(name == ' '){
      name = email;
    }

    return name;
  }

  transformDate(isoDate){
    var date = new Date(isoDate);
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    
    var month = months[date.getMonth()];
    var day = date.getDate();
    var year = date.getFullYear();

    var dateVal = month + ' '+ day + ', ' + year;

    if (dateVal){
      return dateVal;
    }
    else{
      return "No Date Specified";
    }
  }

  isConnectedToFirebase(){
  	// check for Firebase connection
  	console.log("checking for connection...");
    var connectedToFirebaseFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Connected to Firebase.");
          connectedToFirebaseFlag = true;          
        }else {
          console.log("Error connecting to Firebase.");
          connectedToFirebaseFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

    this.connectedToFirebaseFlag = connectedToFirebaseFlag;
    return connectedToFirebaseFlag;
  }

  getUserDataFromLocalDB(){
  	this.storage.get('thisUserData').then(userData =>{
      if(userData){
      	this.userData = userData;
      }
    });
    return this.userData;
  }

  getUserData(userId){
	const data:firebase.database.Reference = firebase.database().ref('/users/' + userId);
    data.on('value', dataSnapshot => {
    	this.userData = dataSnapshot.val();
    });

    // save to local storage
    this.storage.set('thisUserData', this.userData);
    return this.userData;
  }

  saveUsernameFromFirebaseToLocalDB(){
  	if(this.isConnectedToFirebase()){
  	  const uname:firebase.database.Reference = firebase.database().ref('/users/'+this.fire.auth.currentUser.uid);
      uname.on('value', userSnapshot => {
        this.storage.set('username', userSnapshot.val()['username']);
      });
  	}
  }

  getBuiltInTemplatesFromLocalDB(){
  	try{
	  	this.storage.get('built_in_templates').then(templates =>{
	  		if(templates){
	      		this.built_in_templates = templates;
	      	}
	    });
	}catch(e){
		console.log(e);
	}
  }

  getBuiltInTemplates(){
  	if(this.isConnectedToFirebase()){
  	  const templateRef:firebase.database.Reference = firebase.database().ref('/built_in_templates');
      templateRef.on('value', templateSnapshot => {
        this.built_in_templates = [];
        var tempRef = templateSnapshot.val();
        for ( var temp in tempRef){
          this.built_in_templates.push(tempRef[temp]);
        }
        this.storage.set('built_in_templates', this.built_in_templates);
      });
  	}
  	else{
  		this.getBuiltInTemplatesFromLocalDB();
  	}
    return this.built_in_templates;
  }

  saveSurveyData(surveyData, postKey){
  	firebase.database().ref("/surveys/"+postKey).set(surveyData, function(error){
      if(error){
        console.log("Not successful pushing ID to surveys."+error);
      }else{
        console.log("Successfully added the surveyID to surveys!");
      }
    });
  }

  deleteSurveyFromSurveyList(surveyId){
  	var mySurvs = this.getUserSurveysList(this.fire.auth.currentUser.uid);

	var bindSelf = this;
	for( var index in mySurvs){
	  if(surveyId == mySurvs[index]){
	  	firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/surveylist/'+index).remove(
		  function(error) {
		  if(error){
		    console.log("Not able to delete survey on user_survey.");
		  }else{
		    console.log("Survey Deleted on user_survey!");
		    bindSelf.displayToast('Survey Deleted!');
		  }
		});
		break;
	  }
	}
  }

  deleteSurvey(surveyId){
  	let loading = this.loadingCtrl.create({
      content: 'Deleting survey...'
    });

  	loading.present().then(() => {
	  	var bindSelf = this;
	  	firebase.database().ref('/surveys/'+surveyId).remove(
		  function(error) {
		  if(error){
		    console.log("Not able to delete survey on list");
		    loading.dismiss();
		  }else{
		    console.log("Survey Deleted on survey List!");
		    bindSelf.deleteSurveyFromSurveyList(surveyId);
		  	loading.dismiss();
		  }
		});

		// deleting all responses for this survey
		firebase.database().ref('/responses/'+surveyId).remove(
		  function(error) {
		  if(error){
		    console.log("Not able to delete responses.");
		  }else{
		    console.log("Responses for this survey are deleted!");
		  }
		});
	});

	// this.deleteSentInvitation(surveyId);
  }

  deleteSurveyInvitation(surveyId){
  	var bindSelf = this;
  	firebase.database().ref('/user_surveys/'+this.fire.auth.currentUser.uid+'/invitations/'+surveyId).remove(
      function(error) {
      if(error){
        console.log("Not able to delete invitation.");
      }else{
        console.log("Survey ID from invitation removed!");
        bindSelf.displayToast('Invitation Deleted!');
      }
    });
  }

  deleteSentInvitation(surveyId){
  	// iterate to look for all invitation from user_surveys
  	// OR, handle lang ang null valued survey sa receipient.
  }

  getSurveyData(surveyId){
  	var thisSurvey = [];
    const survey:firebase.database.Reference = firebase.database().ref('/surveys/'+surveyId);
  	survey.on('value', surveySnapshot => {
	  thisSurvey = surveySnapshot.val();
	});
	return thisSurvey;
  }

  getUserSurveysAllList(userId){
  	var all = [];
	const surv:firebase.database.Reference = firebase.database().ref('/user_surveys/'+userId);
	surv.on('value', survSnapshot => {
	  all = survSnapshot.val();
	});
	return all;
  }

  getUserSurveysList(userId){
  	var mySurvs = [];
	const surv:firebase.database.Reference = firebase.database().ref('/user_surveys/'+userId+'/surveylist');
	surv.on('value', survSnapshot => {
	  mySurvs = survSnapshot.val();
	});
	return mySurvs;
  }

  getUserInvitationsList(userId){
  	var invits = [];
	const surv:firebase.database.Reference = firebase.database().ref('/user_surveys/'+userId+'/invitations');
	surv.on('value', survSnapshot => {
	  invits = survSnapshot.val();
	});
	return invits;
  }

  getNumResponses(surveyId){
	var num_responses = 0;
  	const resp:firebase.database.Reference = firebase.database().ref('/responses/'+surveyId);
    resp.on('value', respSnapshot => {
      if(respSnapshot.val()){
        num_responses = respSnapshot.numChildren();
      }
    });
    return num_responses;
  }

  updateSurveyStatus(surveyId, status){
    firebase.database().ref("/surveys/"+surveyId+"/isActive").set(status, function(error){
      if(error){
        console.log("Cannot update survey status."+error);
      }else{
        console.log("Survey status updated!");
      }
    });
  }

  updateUserSurveyList(newList){
  	firebase.database().ref("/user_surveys/"+this.fire.auth.currentUser.uid+'/surveylist').set(newList, function(error){
      if(error){
        console.log("Not successful pushing ID to user-survey list."+error);
      }else{
        console.log("Successfully added the surveyID to user-survey list!");
      }
    });
  }


// ================= CONFIGURING COUNTRY_STATE_CITY ====================================
  getCountryStateCityDataFromLocalDB(){
  	var countries = [];
  	try{
	  	this.storage.get('country_state_city').then(data =>{
	      if(data){
	      	countries = data;
	      }
	    });
	}catch(e){
		console.log(e);
	}
	return countries;
  }

  getCountryStateCityDataFromFirebase(){
  	var countries = [];
	const surv:firebase.database.Reference = firebase.database().ref('/country_state_city/');
	surv.on('value', countriesSnapshot => {
	  countries = countriesSnapshot.val();
	});

	// savetoLocalDB
	this.storage.set('country_state_city', countries);

	return countries;
  }

  getCountryStateCityData(){
  	if( this.isConnectedToFirebase()){
  		return this.getCountryStateCityDataFromFirebase();
  	}else{
  		return this.getCountryStateCityDataFromLocalDB();
  	}
  }

  getAllCountryNames(){
  	var countries = this.getCountryStateCityData();
  	var countryNames = [];
  	for( var c in countries){
  		countryNames.push(c);
  	}
  	return countryNames;
  }

  // returns details of states (includes cities)
  getAllStates(){
  	var states = [];
  	var all = this.getCountryStateCityData();
  	for( var country in all){
  		for( var state in all[country]){
  			var temp = {};
	  		temp[state] = '';
	  		temp[state] = all[country];
	  		states.push(temp);
  		}
  	}
  	return states;
  }

  // returns statenames only
  getAllStateNames(){
  	var states = [];
  	var all = this.getCountryStateCityData();
  	for( var country in all){
  		for( var state in all[country]){
	  		states.push(state);
  		}
  	}
  	return states;
  }

  // returns details of states (includes cities); for given country
  getStatesOf(countryId){
  	var states = [];  	
  	if(countryId && countryId != "Anywhere"){
	  	if(this.isConnectedToFirebase()){
			const s:firebase.database.Reference = firebase.database().ref('/country_state_city/'+countryId);
			s.on('value', statesSnapshot => {
				if(statesSnapshot.val()){
			  		var temp = statesSnapshot.val();
			  		states = temp;
			  	}
			});
			return states;
	  	}else{
	  		var all = this.getCountryStateCityDataFromLocalDB();
	  		if(all[countryId]){
	  			states = all[countryId];
	  		}
	  		return states;
	  	}
	}else if(countryId == "Anywhere"){
		return this.getAllStates();
	}
	else{
  		console.log("Not a valid country.");
  		return states;
  	}
  }

  // returns state names of the given country
  getStateNamesOf(countryId){
  	var statenames = [];
  	if(countryId == "Anywhere"){
  		statenames = this.getAllStateNames();
  	}else if(!countryId){
  		console.log("Not a valid country.");
  	}else{
  		for( var state in this.getStatesOf(countryId)){
  			statenames.push(state);
  		}
  	}
  	return statenames;
  }

  getAllCityNames(){
  	var cities = [];
  	var all = this.getCountryStateCityData();
  	for (var country in all){
  		for(var state in all[country]){
  			for( var cityIdx in all[country][state]){
  				cities.push(all[country][state][cityIdx]);
  			}
  		}
  	}
  	return cities;
  }

  getCitiesOf(stateId, countryId){
  	var cities = [];
  	if(stateId && countryId){
  		if(countryId == "Anywhere"){
  			return this.getAllCityNames();
  		}else if(stateId == "Anywhere"){
  			var states = this.getStatesOf(countryId);
  			for( var s in states){
  				for(var city in states[s]){
  					cities.push(states[s][city]);
  				}
  			}
  		}
  		else{
  			var all = this.getCountryStateCityData();
  			if(all[countryId]){
  				return all[countryId][stateId];
  			}
  		}
  	}else{
  		console.log("Invalid country or state.");
  	}
  	return cities;
  }

// ============= ENDOF COUNTRY_STATE_CITY ==========================================

}
