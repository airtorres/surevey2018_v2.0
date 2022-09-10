import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
} from "ionic-angular";

import { QuestionPage } from "../question/question";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import "firebase/database";

import { ConfigurationProvider } from "../../providers/configuration/configuration";

import { Storage } from "@ionic/storage";

/**
 * Generated class for the EditDraftPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-edit-draft",
  templateUrl: "edit-draft.html",
})
export class EditDraftPage {
  @ViewChild("fab") fab;
  @ViewChild("surveyTitle") surveyTitle;
  @ViewChild("surveyDescription") surveyDescription;

  intial_desc = "";
  initial_title = "";
  s_id; // for locating survey to edit

  prev_survey;
  prev_questions;
  prev_title;
  prev_description;

  userCanLeave = true;
  enteringQuestionPage = false;
  savingFlag = false;
  push_flag_for_survey = true;

  survey = [];

  questions = [];
  questions_with_IDs = [];
  question_data;

  currUser;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private alertCtrl: AlertController,
    public configService: ConfigurationProvider,
    private fire: AngularFireAuth,
    private storage: Storage
  ) {
    this.survey = this.navParams.get("item");

    this.s_id = this.navParams.get("s_id");

    this.initial_title = this.survey["title"];
    this.intial_desc = this.survey["description"];

    this.prev_title = JSON.stringify(this.survey["title"]);
    this.prev_description = JSON.stringify(this.survey["description"]);

    if (this.survey) {
      this.questions = this.survey["questions"];
      this.reloadQuestionIDs();
    }

    this.storage.get("currentUser").then((x) => {
      this.currUser = x;
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad EditDraftPage");
  }

  addQuestion(questionType) {
    const data = {
      type: questionType,
    };
    console.log(data);

    this.enteringQuestionPage = true;
    this.fab.close();
    this.navCtrl.push(QuestionPage, data);
  }

  saveChanges() {
    this.survey["title"] = this.surveyTitle.value || "untitled survey";
    this.survey["description"] =
      this.surveyDescription.value || "No Description to show.";
    this.survey["updated_at"] = new Date().toISOString();
    this.survey["created_at"] = new Date().toISOString();
    this.survey["author"] = this.currUser;
    this.survey["isActive"] = true; //the survey is active upon creation

    const connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if (connectedToFirebaseFlag) {
      //   try{
      //     // generate ID for this survey
      //     var newPostKey = firebase.database().ref().child('surveys').push().key;
      //     this.survey['id'] = newPostKey;
      //     firebase.database().ref("/surveys/"+newPostKey).set(this.survey, function(error){
      //       if(error){
      //         console.log("Not successful pushing ID to surveys."+error);
      //         this.showSavingPrompt(true);
      //       }else{
      //         console.log("Successfully added the surveyID to surveys!");
      //         console.log("ATTENTION! IMPLEMENT: Remove this survey from localDB drafts");
      //       }
      //     });
      //     this.s_id = newPostKey;
      //   }catch(e){
      //     console.log("There's a problem pushing the survey.");
      //     console.log(e);
      //     this.showSavingPrompt(true);
      //   }
      //   this.saveToUserSurveyList();
      // }else{
      //   console.log("There's a problem pushing the survey.");
      //   this.showSavingPrompt(false);
    }

    this.showTemporaryAlert();
  }

  showTemporaryAlert() {
    const alert = this.alertCtrl.create({
      title: "Info",
      message: "This functionality will be implemented soon.",
      buttons: ["OK"],
    });
    alert.present();
  }

  saveAsDraft() {
    console.log("SAVING AGAIN AS DRAFT TO BE IMPLEMENTED SOON.");
    this.showTemporaryAlert();
  }

  saveToUserSurveyList() {
    // load surveys from firebase
    try {
      const thisSurveyId = this.s_id;
      let thisUser = {};

      // saving survey id to user's survey list
      const userToSurveyRef: firebase.database.Reference = firebase
        .database()
        .ref("/user_surveys/" + this.fire.auth.currentUser.uid);
      userToSurveyRef.on("value", (userToSurveySnapshot) => {
        thisUser = userToSurveySnapshot.val();
      });

      console.log(thisUser);

      if (thisUser["surveylist"]) {
        thisUser["surveylist"].push(thisSurveyId);
      } else {
        thisUser["surveylist"] = [];
        thisUser["surveylist"].push(thisSurveyId);
      }

      thisUser["email"] = this.fire.auth.currentUser.email;

      firebase
        .database()
        .ref("/user_surveys/" + this.fire.auth.currentUser.uid)
        .set(thisUser, function (error) {
          if (error) {
            console.log("Not successful pushing ID to surveys." + error);
            this.showSavingPrompt(false);
          } else {
            console.log("Successfully added the surveyID to user-survey list!");
          }
        });
      // assume successful saving at this point
      this.savingFlag = true;
      this.navCtrl.pop();

      // pop the templates-list page
      if (this.navParams.get("surveyFromTemplate")) {
        this.navCtrl.pop();
      }

      // redirect to survey-list: showing all surveys
      this.navCtrl.parent.select(1);
    } catch (err) {
      console.log(
        "Something went wrong while pushing survey ID to the users survey list."
      );
      console.log(err);
      this.showSavingPrompt(false);
    }
  }

  confirmDeleteDraft() {
    console.log("DELETE DRAFT TO BE IMPLEMENTED SOON.");
    this.showTemporaryAlert();
  }

  deleteDraft() {
    const alert = this.alertCtrl.create({
      title: "Warning",
      message: "Are you sure to delete this survey?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked. Do not delete survey.");
          },
        },
        {
          text: "Delete",
          handler: () => {
            console.log("deleting survey ...");
            this.confirmDeleteDraft();
          },
        },
      ],
    });
    alert.present();
  }

  deleteQuestion(q_id) {
    this.survey["questions"].splice(q_id, 1);
    this.reloadQuestionIDs();
  }

  editQuestion(q_id) {
    this.enteringQuestionPage = true;
    this.navCtrl.push(QuestionPage, {
      question_data: this.survey["questions"][q_id],
      qID_fromEdit: q_id,
    });
  }

  reloadQuestionIDs() {
    console.log("reloading question IDs ...");

    this.questions_with_IDs = [];
    for (const q in this.questions) {
      const temp = this.questions[q];
      temp["q_id"] = "";
      temp["q_id"] = q;
      this.questions_with_IDs.push(temp);
    }
    this.enteringQuestionPage = false;
    console.log(this.questions_with_IDs);
  }

  public ionViewWillEnter() {
    const push_flag = this.navParams.get("push_flag");
    const replace_flag = this.navParams.get("replace_flag");
    const qID = this.navParams.get("qID"); // qID from question.ts

    if (push_flag) {
      this.question_data = this.navParams.get("question_data") || null;
      console.log("question_data ff: ");
      console.log(this.question_data);

      // push the question to this particular survey
      if (this.question_data != null) {
        if (replace_flag) {
          this.survey["questions"].splice(qID, 1, this.question_data);
        } else {
          this.survey["questions"].push(this.question_data);
        }
      }
      this.reloadQuestionIDs();
    }

    // this.question_data = {};
  }

  public ionViewWillLeave() {
    console.log("leaving create-survey page ...");

    this.question_data = {};
  }

  showSavingPrompt(saveFromTop) {
    return new Promise((resolve, reject) => {
      const alert = this.alertCtrl.create({
        title: "Error saving survey",
        message: "Connection timeout.",
        buttons: [
          {
            text: "Try again",
            handler: () => {
              if (saveFromTop) {
                this.saveChanges();
              } else {
                this.saveToUserSurveyList();
              }
              resolve();
            },
          },
          {
            text: "Save as Draft",
            handler: () => {
              this.userCanLeave = true;
              this.savingFlag = true;
              this.saveAsDraft();
              resolve();
            },
          },
          {
            text: "Do'nt Save",
            role: "cancel",
            handler: () => {
              this.userCanLeave = true;
              this.savingFlag = true;
              reject();
            },
          },
        ],
      });
      alert.present();
    }).catch((error) => this.navCtrl.pop());
  }
}
