import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { QuestionPage } from '../question/question';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

import { Storage } from '@ionic/storage';

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
  savingFlag = false;
  push_flag_for_survey = true;

  survey = {
    'title':'untitled survey',
    'description':'No Description to show.',
    'author_id':'',
    'author': '',
    'created_at': '',
    'updated_at': '',
    'isActive': true, //true/false
    'questions': [],
    'id':''
  };
  questions = [];
  questions_with_IDs = [];
  question_data;

  currUser;

  drafts = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController,
    public configService: ConfigurationProvider,
    private fire: AngularFireAuth,
    private storage: Storage) {

    this.initializeData();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateSurveyPage');
  }

  initializeData(){
    // getting the survey to edit: from survey-summary
    if (this.navParams.get('thisSurvey')){
      this.survey = this.navParams.get('thisSurvey');

      this.s_id = this.navParams.get('s_id');

      this.initial_title = this.survey['title'];
      this.intial_desc = this.survey['description'];

      this.prev_title = JSON.stringify(this.survey['title']);
      this.prev_description = JSON.stringify(this.survey['description']);

      this.push_flag_for_survey = false;
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

      this.push_flag_for_survey = true;
    }
    else{
      this.prev_title = '';
      this.prev_description = '';
      this.push_flag_for_survey = true;
    }

    if( this.survey){
        this.questions = this.survey['questions'];
        this.reloadQuestionIDs();
    }

    this.storage.get('drafts').then(d =>{
      this.drafts = d;
    });

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    // storing the previous values to check the changes
    this.enteringQuestionPage = false;
    this.prev_survey = JSON.stringify(this.survey);
    this.prev_questions = JSON.stringify(this.survey['questions']);
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

  checkIfSameTitle(surveyTitle){
    var mysurveylist = this.configService.getUserSurveysList(this.fire.auth.currentUser.uid);

    var equal = true;
    if(mysurveylist){
      for (var i in mysurveylist){
        if(mysurveylist[i] != this.s_id){
          const survey:firebase.database.Reference = firebase.database().ref('/surveys/'+mysurveylist[i]);
            survey.once('value', surveySnapshot => {
            var isEqualTitle = surveySnapshot.child('title').val() == surveyTitle;
            if (isEqualTitle){
              equal = false;
            }
          });
          // break when duplicate is already found.
          if (!equal){
            break;
          }
        }
      }
    }
    return equal;
  }

  canSave(popFlag){
    var isValidTitle = true;
    
    if (this.surveyTitle.value && this.surveyTitle.value != ''){
      var pattern = new RegExp("^([a-zA-Z0-9]+)([a-zA-Z0-9]+[ \\.\\-\\,\\(\\)\\+\\$\\!\\?]+)*[a-zA-Z0-9]+$");
      isValidTitle = pattern.test(this.surveyTitle.value);

      var noDuplicate = this.checkIfSameTitle(this.surveyTitle.value);
      console.log(noDuplicate);

      if(isValidTitle && noDuplicate){
        if(this.questions && this.questions.length > 0){
          this.saveChanges(popFlag);
        }else{
          this.configService.displayToast('You must have at least 1 question!');
        }
      }else if(!noDuplicate){
        this.configService.showSimpleAlert('Duplicate Title','Try another title for this survey.');
      }else{
        this.configService.displayToast('Invalid Survey Title!');
      }
    }else{
      this.configService.displayToast('Empty survey title!');
    }
  }

  saveChanges(popFlag){
    this.survey['title'] = this.surveyTitle.value || "untitled survey";
    this.survey['description'] = this.surveyDescription.value || "No Description to show.";
    this.survey['updated_at'] = new Date().toISOString();
    this.survey['author'] = this.currUser;
    this.survey['isActive'] = true;//the survey is active upon creation

    // check for Firebase connection
    var connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if (this.push_flag_for_survey){
      this.survey['created_at'] = new Date().toISOString();

      if(connectedToFirebaseFlag){
        try{
          this.survey['author_id'] = this.fire.auth.currentUser.uid;
        }catch(e){
          console.log(e);
        }

        try{
          // generate ID for this survey
          var newPostKey = firebase.database().ref().child('surveys').push().key;
          this.survey['id'] = newPostKey;
          this.configService.saveSurveyData(this.survey, newPostKey);
          this.s_id = newPostKey;
        }catch(e){
          console.log("There's a problem pushing the survey.");
          console.log(e);
          this.showSavingPrompt(true);
        }

        this.saveToUserSurveyList(popFlag);
      }else{
        console.log("There's a problem pushing the survey.");
        this.showSavingPrompt(true);
      }
    }
    // Editing survey
    else{
      if(connectedToFirebaseFlag){
        try{
          this.survey['updated_at'] = new Date().toISOString();

          this.configService.saveSurveyData(this.survey, this.s_id);

          this.savingFlag = true;
          if(popFlag){
            this.navCtrl.pop();
            this.configService.displayToast('Success! Survey Saved.');
          }
          // redirect to survey-list: showing all surveys
          // this.navCtrl.parent.select(1);
        }catch(e){
          console.log("There's a problem pushing the survey.");
          console.log(e);
          this.showSavingPrompt(true);
        }
      }else{
        console.log("There's a problem pushing the survey.");
        this.showSavingPrompt(true);
      }
    }
  }

  saveToUserSurveyList(popFlag){
    try{
      var mylist = [];
      var thisSurveyId = this.s_id;
      var mysurveylist = this.configService.getUserSurveysList(this.fire.auth.currentUser.uid);

      if(mysurveylist){
        for(var m in mysurveylist){
          mylist.push(mysurveylist[m]);
        }
        mylist.push(thisSurveyId);
      }else{
        mylist.push(thisSurveyId);
      }

      this.configService.updateUserSurveyList(mylist);

      // assume successful saving at this point
      this.savingFlag = true;

       // pop the templates-list page
      if(this.navParams.get('surveyFromTemplate')){
        this.navCtrl.pop();
      }

      if(popFlag){
        this.navCtrl.pop();
      }

      this.configService.displayToast('Success! Survey Saved.');
      // redirect to survey-list: showing all surveys
      this.navCtrl.parent.select(1);

    }catch(err){
      console.log("Something went wrong while pushing survey ID to the users survey list.");
      console.log(err);
      this.showSavingPrompt(false);
    }
  }

  confirmedDelete(q_id){
    this.survey['questions'].splice(q_id,1);
    this.reloadQuestionIDs();
  }

  deleteQuestion(q_id, q_msg){
    let alert = this.alertCtrl.create({
      title: 'Are you sure to delete this question?',
      message: q_msg,
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel'
      },
      {
        text: 'Delete',
        handler: () => {
          this.confirmedDelete(q_id);
        }
      }
    ]
    });
    alert.present();
  }

  editQuestion(q_id){
    this.enteringQuestionPage = true;
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
    this.enteringQuestionPage = false;
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
    if (!this.userCanLeave && !this.enteringQuestionPage && !this.savingFlag) {
      return new Promise((resolve, reject) => {
        let alert = this.alertCtrl.create({
          title: 'Changes made',
          message: 'Do you want to save?',
          buttons: [
            {
              text: "Don't Save",
              handler: () => {
                console.log("User didn't saved data");
                this.initializeData();
                this.userCanLeave = true;
                resolve();
              }
            },
            {
              text: 'Save',
              handler: () => {
                console.log('User saved data');
                this.canSave(false);
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

  saveAsDraft(){
    this.drafts.push(this.survey);

    this.storage.set('drafts', this.drafts);
    // redirect to survey-list: showing all surveys
    this.navCtrl.parent.select(1);

    this.navCtrl.pop();
  }

  showSavingPrompt(saveFromTop){
    return new Promise((resolve, reject) => {
      let alert = this.alertCtrl.create({
        title: 'Error saving survey',
        message: 'Connection timeout.',
        buttons: [
          {
            text: "Try again",
            handler: () => {
              if(saveFromTop){
                this.saveChanges(false);
              }else{
                this.saveToUserSurveyList(false);
              }
              resolve();
            }
          },
          {
            text: 'Save as Draft',
            handler: () => {
              this.userCanLeave = true;
              this.savingFlag = true;
              this.saveAsDraft();
              resolve();
            }
          },
          {
            text: "Do'nt Save",
            role: 'cancel',
            handler: () => {
              this.userCanLeave = true;
              this.savingFlag = true;
              reject();
            }
          },
        ]
      });
      alert.present();
    }).catch((error) => this.navCtrl.pop());
  }

}
