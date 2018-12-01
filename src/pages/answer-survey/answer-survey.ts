import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { Storage } from '@ionic/storage';

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
  title;
  s_id;
  description;
  questions;

  currUser;
  users = {};

  responses = {};
  response = {
  	'respondent': '',
  	'survey_id': null,
  	'answers': [],
  	'submitted_at': new Date()
  };

  public answers = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private storage: Storage,
  	private alertCtrl: AlertController) {
  	this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    this.storage.get("responses").then(res => {
        this.responses = res;
    });

    this.storage.get("users").then(usr => {
        this.users = usr;
        console.log(usr);
    });

  	this.thisSurvey = navParams.get('item');

    if (this.navParams.get('diff_respondent_flag')){
      this.currUser = this.respondent_name? this.respondent_name: 'no name available';
    }

  	this.title = this.thisSurvey['title'];
  	this.description = this.thisSurvey['description'];
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
    			console.log(o);
    			this.answers[q][o] = false;
    		}
    	}
    	else{
    		this.answers[q] = '';
    	}
    }
  }

  ionViewDidLoad() {
  	console.log(this.questions);
    console.log('ionViewDidLoad AnswerSurveyPage');
  }

  submitResponse(){
    console.log("submitting response ...")
    console.log(this.answers);

  	// save responses to ionic localStorage
  	this.response['respondent'] = this.currUser;
  	this.response['survey_id'] = this.s_id;
  	this.response['submitted_at'] = new Date();
  	this.response['answers'] = this.answers;

  	if(this.responses){
      JSON.parse(this.responses['responses'].push(this.response));
    }
    else{
      this.responses = {'responses': ''};
      this.responses['responses'] = [this.response];
    }

    this.storage.set('responses', this.responses).then((val) =>{});

    var usr = this.users['users'];

    for ( var i in usr){
      if (usr[i]['email'] == this.currUser){
        for (var x in usr[i]['invitations']){

          var invi = usr[i]['invitations'][x];

          if( invi['s_id'] == this.s_id){
            var temp = {
              's_id': this.s_id,
              'status': 'completed'
            }

            invi = temp;
            usr[i]['invitations'][x] = invi;

          }
        }
        break;
      }
    }

    this.users['users'] = usr;
    console.log(this.users);
    // update users
    this.storage.set('users', this.users).then((data) => {});

    let alert = this.alertCtrl.create({
      title: 'Success',
      message: 'Answers Submitted!.',
      buttons: ['OK']
    });
    alert.present();

    this.navCtrl.pop();
  }

}
