import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Storage } from '@ionic/storage';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { NewMsgPage } from '../new-msg/new-msg';

/**
 * Generated class for the AnswerSurveyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-answer-survey',
  templateUrl: 'answer-survey.html',
})
export class AnswerSurveyPage {
  @ViewChild('respondent_name') respondent_name;

  thisSurvey;
  title = '(Untitled Survey)';
  s_id;
  description = 'No description to show.';
  author = 'Unknown author';
  author_id;
  author_name;
  questions;

  offline_responses = [];

  currUser;
  users = {};

  responses = {};
  response = {
  	'respondent': '',
  	'survey_id': '',
  	'answers': [],
  	'submitted_at': ''
  };

  public answers = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private fire: AngularFireAuth,
  	private storage: Storage,
    public configService: ConfigurationProvider,
  	private alertCtrl: AlertController) {

  	this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    try{
      this.storage.get('offline_responses').then(res =>{
        if(res){
          this.offline_responses = res;
        }
      });
    }catch(e){
      console.log(e);
    }

    // DB structure: survey_id -> user_id -> responses

  	this.thisSurvey = navParams.get('item');

  	this.title = this.thisSurvey['title'];
  	this.description = this.thisSurvey['description'];
    this.author = this.thisSurvey['author'];
    this.author_id = this.thisSurvey['author_id'];
    this.author_name = this.transformAuthorName(this.author_id, this.author);
    this.s_id = this.thisSurvey['id'];

    this.questions = this.thisSurvey['questions'];
    // saving the id of the question to its selfNode
    for (var q in this.questions){
    	this.questions[q]['id'] = '';
    	this.questions[q]['id'] = q;

    	if ( this.questions[q]['type'] == "checkbox"){
    		this.answers[q] = [];

    		// initializing the checkboxes to false
    		for (var o in this.questions[q]['options']){
    			this.answers[q][o] = false;
    		}
    	}
    	else{
    		this.answers[q] = '';
    	}
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnswerSurveyPage');
  }

  transformAuthorName(authorId, email){
    return this.configService.transformAuthorName(authorId, email);
  }

  showSubmitError(){
    console.log("ERROR SUBMITTING at responses/user_surveys");
  }

  showNetworkError(){
    let alert = this.alertCtrl.create({
      title: 'Network Error',
      message: 'You must be connected to the Internet.',
      buttons: ['OK']
    });
    alert.present();
  }

  showSuccesSubmit(){
    let alert = this.alertCtrl.create({
      title: 'Success',
      message: 'Answers Submitted!.',
      buttons: ['OK']
    });
    alert.present();
  }

  UpdateInvitationStatus(){
    try{
      firebase.database().ref("/user_surveys/"+this.fire.auth.currentUser.uid+"/invitations/"+this.s_id+"/status").set("completed", function(error){
        if(error){
          console.log("Not successful updating invitation status."+error);
          this.showSubmitError();
        }else{
          console.log("Successfully updated: invitation status to completed!");
        }
      });

      // pop this page
      this.navCtrl.pop();
    }catch(e){
      console.log(e);
    }
  }

  saveToLocalDB(response){
    console.log("saving response to local storage...");

    if(this.offline_responses[this.s_id]){
      // there are offline responses for this survey
      this.offline_responses[this.s_id].push(response);
    }
    else{
      this.offline_responses[this.s_id] = [];
      this.offline_responses[this.s_id].push(response);
    }

    this.storage.set('offline_responses', this.offline_responses);
    this.navCtrl.pop();
  }

  submitResponse(){
    var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    console.log("submitting response ...")

  	this.response['respondent'] = this.currUser;
  	this.response['survey_id'] = this.s_id;
  	this.response['submitted_at'] = new Date().toISOString();
  	this.response['answers'] = this.answers;

    for( var q in this.questions){
      if(this.questions[q]['type'] == 'checkbox'){
        var finalAns = [];
        for( var a in this.answers[q]){
          if(this.answers[q][a] == true){
            finalAns.push(this.questions[q]['options'][a]);
          }
        }
        this.answers[q] = finalAns;
      }
    }

    // setting the respondents name through 'manual' input
    // STORE to localDB
    if (this.navParams.get('diff_respondent_flag')){
      // USE NEWLY GENERATED KEY for this unique user...
      var newUserKey = firebase.database().ref().child('responses/'+this.s_id).push().key;
      this.response['respondent'] = this.respondent_name? this.respondent_name.value: newUserKey;

      if(connectedToFirebaseFlag){
        try{
          firebase.database().ref("/responses/"+this.s_id+"/"+newUserKey).set(this.response, function(error){
            if(error){
              console.log("Not successful pushing response to list of responses."+error);
            }else{
              console.log("Successfully added to responses!");
            }
          });
        }catch(e){
          console.log(e);
        }

        this.navCtrl.pop();
      }else{
        this.saveToLocalDB(this.response);
      }
    }
    else{
      // store response to firebase
      if(connectedToFirebaseFlag){
        try{
          firebase.database().ref("/responses/"+this.s_id+"/"+this.fire.auth.currentUser.uid).set(this.response, function(error){
            if(error){
              console.log("Not successful pushing response to list of responses."+error);
              this.showSubmitError();
            }else{
              console.log("Successfully added to responses!");
            }
          });

          // update USER_SURVEYS invitation to COMPLETED
          this.UpdateInvitationStatus();
        }catch(e){
          console.log(e);
        }
      }
      else{
        this.showNetworkError();
      }
    }
  }

  sendMessage(){
    console.log("Redirecting to chat...");
    this.navCtrl.push(NewMsgPage, {'chatmate' : this.author});
  }

}
