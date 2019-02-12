import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { QuestionPage } from '../question/question';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/database';

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
    private fire: AngularFireAuth,
    private storage: Storage) {

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
    this.survey['title'] = this.surveyTitle.value || "untitled survey";
    this.survey['description'] = this.surveyDescription.value || "No Description to show.";
    this.survey['updated_at'] = new Date().toISOString();
    this.survey['author'] = this.currUser;
    this.survey['isActive'] = true;//the survey is active upon creation

    // check for Firebase connection
    var connectedToFirebaseFlag = false;
    try{
      const firebaseRef:firebase.database.Reference = firebase.database().ref('/');
      firebaseRef.child('.info/connected').on('value', function(connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Getting data from Firebase...");
          connectedToFirebaseFlag = true;          
        }else {
          console.log("Error loading data from Firebase.");
          connectedToFirebaseFlag = false;
        }
      });
    }catch(e){
      console.log(e);
    }

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
          firebase.database().ref("/surveys/"+newPostKey).set(this.survey, function(error){
            if(error){
              console.log("Not successful pushing ID to surveys."+error);
              this.showSavingPrompt(true);
            }else{
              console.log("Successfully added the surveyID to surveys!");
            }
          });
          this.s_id = newPostKey;
        }catch(e){
          console.log("There's a problem pushing the survey.");
          console.log(e);
          this.showSavingPrompt(true);
        }

        this.saveToUserSurveyList();
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

          firebase.database().ref("/surveys/"+this.s_id).set(this.survey, function(error){
            if(error){
              console.log("Not successful pushing ID to surveys."+error);
              this.showSavingPrompt(true);
            }else{
              console.log("Successfully added the surveyID to surveys!");
            }
          });
          this.savingFlag = true;
          this.navCtrl.pop();
          // redirect to survey-list: showing all surveys
          this.navCtrl.parent.select(1);
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

  saveToUserSurveyList(){
    // load surveys from firebase
    try{
      var thisSurveyId = this.s_id;
      var thisUser = {};

      // saving survey id to user's survey list
      const userToSurveyRef:firebase.database.Reference = firebase.database().ref("/user_surveys/"+this.fire.auth.currentUser.uid);
      userToSurveyRef.on('value', userToSurveySnapshot => {
        thisUser = userToSurveySnapshot.val();
      });

      console.log(thisUser);

      if(thisUser['surveylist']){
        thisUser['surveylist'].push(thisSurveyId);
      }else{
        thisUser['surveylist'] = [];
        thisUser['surveylist'].push(thisSurveyId);
      }

      thisUser['email'] = this.fire.auth.currentUser.email;

      firebase.database().ref("/user_surveys/"+this.fire.auth.currentUser.uid).set(thisUser, function(error){
        if(error){
          console.log("Not successful pushing ID to surveys."+error);
          this.showSavingPrompt(false);
        }else{
          console.log("Successfully added the surveyID to user-survey list!");
        }
      });
      // assume successful saving at this point
      this.savingFlag = true;
      this.navCtrl.pop();

       // pop the templates-list page
      if(this.navParams.get('surveyFromTemplate')){
        this.navCtrl.pop();
      }

      // redirect to survey-list: showing all surveys
      this.navCtrl.parent.select(1);

    }catch(err){
      console.log("Something went wrong while pushing survey ID to the users survey list.");
      console.log(err);
      this.showSavingPrompt(false);
    }
  }

  deleteQuestion(q_id){
    this.survey['questions'].splice(q_id,1);
    this.reloadQuestionIDs();
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
                this.saveChanges();
              }else{
                this.saveToUserSurveyList();
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
