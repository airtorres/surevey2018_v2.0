import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { QuestionPage } from '../question/question';
import { SurveyListPage } from '../survey-list/survey-list';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the CreateSurveyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-survey',
  templateUrl: 'create-survey.html',
})
export class CreateSurveyPage {
	@ViewChild('fab') fab;
  @ViewChild('surveyTitle') surveyTitle;
  @ViewChild('surveyDescription') surveyDescription;

  surveys = {};
  survey = {
    'title':'untitled survey',
    'description':'No Description to show.',
    'created_at': new Date(),
    'updated_at': null,
    'end_date': null,
    'isActive': true, //true/false
    'questions': []
  };
  questions = [];
  question_data;

  currUser;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage) {

    this.storage.get("surveys").then(value => {
        this.surveys = value;
    });

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateSurveyPage');
  }

  addQuestion(questionType) {
  	let data = {
  		type: questionType
  	}
  	console.log(data);

  	this.fab.close();
  	this.navCtrl.push(QuestionPage, data);
  }

  saveChanges(){
    // save changes to ionic localStorage
    this.survey['title'] = this.surveyTitle.value || "untitled survey";
    this.survey['description'] = this.surveyDescription.value || "No Description to show.";
    this.survey['updated_at'] = new Date();
    this.survey['isActive'] = true;//the survey is active upon creation

    if(this.surveys){
      JSON.parse(this.surveys['surveys'].push(this.survey));
    }
    else{
      this.surveys = {'surveys': ''};
      this.surveys['surveys'] = [this.survey];
    }
    this.storage.set('surveys', this.surveys).then((val) =>{
      // getting this survey's id
      this.storage.get('surveys').then((s) => {
        if (s){
           for ( var surv_id in s['surveys']){
              // console.log(s['surveys'][surv]);

              // find the currently added survey and add to currentUser
              if( JSON.stringify(this.survey) == JSON.stringify(s['surveys'][surv_id])){
                // console.log(surv_id);                

                this.storage.get('users').then((u) => {
                  for ( var i in u['users']){
                    if (u['users'][i]['email'] == this.currUser){
                        u['users'][i]['surveys'].push(surv_id);
                        // update users
                        this.storage.set('users', u).then((data) => {
                          return
                        });
                      }
                  }
                });
                break;
              }
           }
          }
      });
    });

    // redirect to survey-list: showing all surveys
    this.navCtrl.setRoot(SurveyListPage);
  }

  public ionViewWillEnter() {
    this.question_data = this.navParams.get('question_data') || null;
    console.log("question_data ff: ");
    console.log(this.question_data);

    // push the question to this particular survey
    if (this.question_data != null){
      this.survey['questions'].push(this.question_data);
    }
  }

}
