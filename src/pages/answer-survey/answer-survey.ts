import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
  thisSurvey;
  title;
  s_id;
  description;
  questions;

  currUser;

  responses;
  response = {
  	'respondent': '',
  	'survey_id': null,
  	'answers': [],
  	'submitted_at': new Date()
  };

  answers = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
  	private storage: Storage) {
  	this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

  	this.thisSurvey = navParams.get('item');

  	this.title = this.thisSurvey['title'];
  	this.description = this.thisSurvey['description'];
    this.s_id = this.thisSurvey['id'];

    this.questions = this.thisSurvey['questions'];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AnswerSurveyPage');
  }

  submitResponse(){
    console.log("submitting response ...")

  	// save responses to ionic localStorage
  	this.response['respondent'] = this.currUser;
  	this.response['survey_id'] = this.s_id;
  	this.response['submitted_at'] = new Date();

  	if(this.responses){
      JSON.parse(this.responses['responses'].push(this.response));
    }
    else{
      this.responses = {'responses': ''};
      this.responses['responses'] = [this.response];
    }

    this.storage.set('responses', this.responses).then((val) =>{
    	this.storage.get('users').then((u) => {
          	for ( var i in u['users']){
              if (u['users'][i]['email'] == this.currUser){
                var invitations = u['users'][i]['invitations'];

                for (var invi in invitations){
                	if(invitations[invi]['s_id'] == this.s_id){
                		invitations[invi]['status'] = 'completed';
                		u['users'][i]['invitations'] = invitations;
                		break;
                	}
                }

                // update users
                this.storage.set('users', u).then((data) => {
                  return
                });
              }
            }
        });
    });
  }

}
