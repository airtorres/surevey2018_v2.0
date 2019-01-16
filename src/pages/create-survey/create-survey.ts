import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { QuestionPage } from '../question/question';

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

  intial_desc = '';
  initial_title = '';
  s_id;// for locating survey to edit

  prev_survey;
  prev_questions;
  prev_title;
  prev_description;

  userCanLeave = true;
  enteringQuestionPage = false;

  surveys = {};
  survey = {
    'title':'untitled survey',
    'description':'No Description to show.',
    'author': '',
    'created_at': new Date(),
    'updated_at': null,
    'end_date': null,
    'isActive': true, //true/false
    'questions': []
  };
  questions = [];
  questions_with_IDs = [];
  question_data;

  currUser;

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController, 
    private storage: Storage) {

    // getting the survey to edit: from survey-summary
    if (this.navParams.get('thisSurvey')){
      this.survey = this.navParams.get('thisSurvey');

      this.s_id = this.navParams.get('s_id');

      this.initial_title = this.survey['title'];
      this.intial_desc = this.survey['description'];

      this.prev_title = JSON.stringify(this.survey['title']);
      this.prev_description = JSON.stringify(this.survey['description']);
    }
    else if(this.navParams.get('surveyFromTemplate')){
      var survTemplate = this.navParams.get('surveyFromTemplate');

      this.initial_title = survTemplate['title'];
      this.intial_desc = survTemplate['description'];

      // these 3 properties came from the built-in template
      this.survey['title'] = survTemplate['title'];
      this.survey['description'] = survTemplate['description'];
      this.survey['questions'] = survTemplate['questions'];

      this.prev_title = JSON.stringify(this.survey['title']);
      this.prev_description = JSON.stringify(this.survey['description']);
    }
    else{
      this.prev_title = '';
      this.prev_description = '';
    }

    if( this.survey){
        this.questions = this.survey['questions'];
        this.reloadQuestionIDs();
    }

    this.storage.get("surveys").then(value => {
        this.surveys = value;
    });

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    // storing the previous values to check the changes
    this.prev_survey = JSON.stringify(this.survey);
    this.prev_questions = JSON.stringify(this.survey['questions']);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateSurveyPage');
  }

  addQuestion(questionType) {
  	let data = {
  		type: questionType
  	}
  	console.log(data);

    this.enteringQuestionPage = true;
  	this.fab.close();
  	this.navCtrl.push(QuestionPage, data);
  }

  saveChanges(){
    // save changes to ionic localStorage
    this.survey['title'] = this.surveyTitle.value || "untitled survey";
    this.survey['description'] = this.surveyDescription.value || "No Description to show.";
    this.survey['updated_at'] = new Date();
    this.survey['author'] = this.currUser;
    this.survey['isActive'] = true;//the survey is active upon creation

    var push_flag_for_survey = true;

    if(this.surveys){
      for( var surv_id in this.surveys['surveys'] ){
        var author = this.surveys['surveys'][surv_id]['author'];
        if( surv_id == this.s_id && this.survey['author'] == author){
          // replacing the survey: @editing
          this.survey['updated_at'] = new Date();

          this.surveys['surveys'][surv_id] = this.survey;

          push_flag_for_survey = false;
          break;
        }
      }

      if (push_flag_for_survey){
        JSON.parse(this.surveys['surveys'].push(this.survey));
      }
    }
    else{
      this.surveys = {'surveys': ''};
      this.surveys['surveys'] = [this.survey];
    }

    if(push_flag_for_survey){

      // getting the survey id
      var this_id;
      for ( var this_surv_id in this.surveys['surveys']){
        if( JSON.stringify(this.survey) == JSON.stringify(this.surveys['surveys'][this_surv_id])){
          this_id = this_surv_id;
          break;
        }
      }

      // saving survey id to user's surveys list
      this.storage.get('users').then((u) => {
        for ( var i in u['users']){
          if (u['users'][i]['email'] == this.currUser){
            console.log("pushing survey id = "+this_id+" to user = "+ this.currUser +" ...");
            u['users'][i]['surveys'].push(this_id);
            // update users
            this.storage.set('users', u).then((data) => {
              return
            });
          }
        }
      });
    }

    this.storage.set('surveys', this.surveys).then((val) =>{});


    // redirect to survey-list: showing all surveys
    this.navCtrl.pop();
    this.navCtrl.parent.select(1);
  }

  deleteQuestion(q_id){
    this.survey['questions'].splice(q_id,1);
    this.reloadQuestionIDs();
  }

  editQuestion(q_id){
    this.navCtrl.push(QuestionPage, {question_data: this.survey['questions'][q_id], qID_fromEdit: q_id});
  }

  reloadQuestionIDs(){
    console.log("reloading question IDs ...");

    this.questions_with_IDs = [];
    for ( var q in this.questions){
      var temp = this.questions[q];
      temp['q_id'] = '';
      temp['q_id'] = q;
      this.questions_with_IDs.push(temp);
    }

    console.log(this.questions_with_IDs);
  }

  public ionViewWillEnter() {
    var push_flag = this.navParams.get('push_flag');
    var replace_flag = this.navParams.get('replace_flag');
    var qID = this.navParams.get('qID');// qID from question.ts

    if( push_flag){
      this.question_data = this.navParams.get('question_data') || null;
      console.log("question_data ff: ");
      console.log(this.question_data);

      // push the question to this particular survey
      if (this.question_data != null){
        if(replace_flag){
          this.survey['questions'].splice(qID, 1, this.question_data);
        }
        else{
          this.survey['questions'].push(this.question_data);
        }
      }
      this.reloadQuestionIDs();
    }

    // this.question_data = {};
  }

  checkAllChanges(){
    if (this.navParams.get('surveyFromTemplate') || this.navParams.get('thisSurvey')){
      if (this.prev_survey == JSON.stringify(this.survey) && this.prev_questions == JSON.stringify(this.questions)
        // && this.prev_description == this.surveyDescription.value && this.prev_title == this.surveyTitle.value){
          && '"'+this.surveyDescription.value+'"' == this.prev_description && '"'+this.surveyTitle.value+'"' == this.prev_title){
        console.log("NO CHANGES MADE.");
        this.userCanLeave = true;
      }else{
        console.log("THERE ARE UNSAVED CHANGES.");
        this.userCanLeave = false;
      }
    }
    else{
      if (this.prev_survey == JSON.stringify(this.survey) && this.prev_questions == JSON.stringify(this.questions)
        && this.prev_description == this.surveyDescription.value && this.prev_title== this.surveyTitle.value){
        console.log("NO CHANGES MADE.");
        this.userCanLeave = true;
      }else{
        console.log("THERE ARE UNSAVED CHANGES.");
        this.userCanLeave = false;
      }
    }
  }

  public ionViewWillLeave() {
    console.log("leaving create-survey page ...");

    this.question_data = {};
  }

  ionViewCanLeave() {
    console.log("checking the page if allowed to leave ...");
    this.checkAllChanges();

    // here you can use other vars to see if there are reasons we want to keep user in this page:
    if (!this.userCanLeave && !this.enteringQuestionPage) {
      return new Promise((resolve, reject) => {
        let alert = this.alertCtrl.create({
          title: 'Changes made',
          message: 'Do you want to save?',
          buttons: [
            {
              text: "Don't Save",
              handler: () => {
                console.log("User didn't saved data");
                // do saving logic
                this.userCanLeave = true;
                resolve();
              }
            },
            {
              text: 'Save',
              handler: () => {
                console.log('User saved data');
                // do saving logic
                this.saveChanges();
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
    } else { return true }
  }

}
