import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  LoadingController,
} from "ionic-angular";

import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import "firebase/database";

import { Storage } from "@ionic/storage";

import { ConfigurationProvider } from "../../providers/configuration/configuration";

import { ChatPage } from "../chat/chat";

/**
 * Generated class for the AnswerSurveyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-answer-survey",
  templateUrl: "answer-survey.html",
})
export class AnswerSurveyPage {
  @ViewChild("respondent_name") respondent_name;

  thisSurvey;
  title = "(Untitled Survey)";
  s_id;
  description = "No description to show.";
  author = "Unknown author";
  author_id;
  author_name;
  questions;

  offline_responses = [];

  currUser;
  users = {};

  response = {
    respondent: "",
    survey_id: "",
    answers: [],
    submitted_at: "",
  };

  notification = {
    type: "respond",
    s_id: "",
    s_status: "",
    s_author: "",
    s_author_id: "",
    s_title: "",
    s_respondent: "",
    s_respondent_id: "",
    isSeen: false,
  };
  notifID;

  public answers = [];

  viewOnly = false;
  okayAnswers = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private fire: AngularFireAuth,
    private storage: Storage,
    public configService: ConfigurationProvider,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    this.storage.get("currentUser").then((x) => {
      this.currUser = x;
    });

    try {
      this.storage.get("offline_responses").then((res) => {
        if (res) {
          this.offline_responses = res;
        }
      });
    } catch (e) {
      console.log(e);
    }

    this.notifID = navParams.get("notifID");

    // DB structure: survey_id -> user_id -> responses

    this.thisSurvey = navParams.get("item");

    this.title = this.thisSurvey["title"];
    this.description = this.thisSurvey["description"];
    this.author = this.thisSurvey["author"];
    this.author_id = this.thisSurvey["author_id"];
    this.author_name = this.transformAuthorName(this.author_id, this.author);
    this.s_id = this.thisSurvey["id"];

    this.questions = this.thisSurvey["questions"];
    // saving the id of the question to its selfNode
    for (const q in this.questions) {
      this.questions[q]["id"] = "";
      this.questions[q]["id"] = q;

      if (this.questions[q]["type"] == "checkbox") {
        this.answers[q] = [];

        // initializing the checkboxes to false
        for (const o in this.questions[q]["options"]) {
          this.answers[q][o] = false;
        }
      } else {
        this.answers[q] = "";
      }
    }
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad AnswerSurveyPage");
  }

  transformAuthorName(authorId, email) {
    return this.configService.transformAuthorName(authorId, email);
  }

  showSubmitError() {
    console.log("ERROR SUBMITTING at responses/user_surveys");
  }

  showNetworkError() {
    const alert = this.alertCtrl.create({
      title: "Network Error",
      message: "You must be connected to the Internet.",
      buttons: ["OK"],
    });
    alert.present();
  }

  showSuccesSubmit() {
    const alert = this.alertCtrl.create({
      title: "Success",
      message: "Answers Submitted!.",
      buttons: ["OK"],
    });
    alert.present();
  }

  UpdateInvitationStatus() {
    try {
      const that = this;
      firebase
        .database()
        .ref(
          "/user_surveys/" +
            this.fire.auth.currentUser.uid +
            "/invitations/" +
            this.s_id +
            "/status"
        )
        .set("completed", function (error) {
          if (error) {
            console.log("Not successful updating invitation status." + error);
            that.showSubmitError();
          } else {
            console.log(
              "Successfully updated: invitation status to completed!"
            );
            that.configService.displayToast("Success! Response recorded.");
          }
        });
    } catch (e) {
      console.log(e);
    }
  }

  UpdateNotifSurveyStatus() {
    try {
      const that = this;
      firebase
        .database()
        .ref(
          "/notifications/" +
            this.fire.auth.currentUser.uid +
            "/surveyNotifs/" +
            this.notifID +
            "/s_status"
        )
        .set("completed", function (error) {
          if (error) {
            console.log(
              "Not successful updating invitation status in notifications." +
                error
            );
            that.showSubmitError();
          } else {
            console.log(
              "Successfully updated: invitation status to completed in notifications!"
            );
          }
        });
    } catch (e) {
      console.log(e);
    }
  }

  saveToLocalDB(response) {
    console.log("saving response to local storage...");

    if (this.offline_responses[this.s_id]) {
      // there are offline responses for this survey
      this.offline_responses[this.s_id].push(response);
    } else {
      this.offline_responses[this.s_id] = [];
      this.offline_responses[this.s_id].push(response);
    }

    this.storage.get("mySurveys").then((mySurveys) => {
      if (mySurveys) {
        for (const mySurv in mySurveys) {
          if (mySurveys[mySurv]["id"] == this.s_id) {
            let numresponses = mySurveys[mySurv]["num_responses"];

            numresponses = numresponses + 1;
            mySurveys[mySurv]["num_responses"] = numresponses;

            this.storage.set("mySurveys", mySurveys);
            break;
          }
        }
      }
    });

    this.storage.set("offline_responses", this.offline_responses);
    this.navCtrl.pop();
  }

  submit() {
    this.okayAnswers = [];

    let cleanSaveFlag = true;
    for (const q in this.questions) {
      if (
        this.questions[q]["isRequired"] == true &&
        (this.answers[q] == "" ||
          this.answers[q] == null ||
          this.answers[q] == undefined)
      ) {
        cleanSaveFlag = false;
        this.okayAnswers.push(1);
      } else {
        this.okayAnswers.push(0);
      }
    }

    if (cleanSaveFlag) {
      this.submitResponse();
    } else {
      this.configService.displayToast("Some answers are Empty or Invalid!");

      for (const idx in this.questions) {
        if (this.okayAnswers[idx] == 1) {
          document.getElementById("qItem_" + idx).classList.add("warning");
        } else {
          document.getElementById("qItem_" + idx).classList.remove("warning");
        }
      }
    }
  }

  submitResponse() {
    const loadingSubmitting = this.loadingCtrl.create({
      content: "Submitting response",
    });

    loadingSubmitting.present().then(() => {
      const connectedToFirebaseFlag = this.configService.isConnectedToFirebase();
      const bindSelf = this;

      console.log("submitting response ...");

      this.response["respondent"] = this.currUser;
      this.response["survey_id"] = this.s_id;
      this.response["submitted_at"] = new Date().toISOString();
      this.response["answers"] = this.answers;

      this.notification["s_id"] = this.s_id;
      this.notification["s_author"] = this.thisSurvey["author"];
      this.notification["s_author_id"] = this.thisSurvey["author_id"];
      this.notification["s_title"] = this.thisSurvey["title"];
      this.notification["s_respondent"] = this.currUser;
      this.notification["s_respondent_id"] = this.fire.auth.currentUser.uid;
      this.notification["date"] = new Date().toISOString();
      const newNotifKey = firebase
        .database()
        .ref()
        .child(
          "/notifications/" + this.thisSurvey["author_id"] + "/surveyNotifs/"
        )
        .push().key;
      this.notification["notifId"] = newNotifKey;

      for (const q in this.questions) {
        if (this.questions[q]["type"] == "checkbox") {
          const finalAns = [];
          for (const a in this.answers[q]) {
            if (this.answers[q][a] == true) {
              finalAns.push(this.questions[q]["options"][a]);
            }
          }
          this.answers[q] = finalAns;
        }
      }

      const that = this;

      // setting the respondents name through 'manual' input
      // STORE to localDB
      if (this.navParams.get("diff_respondent_flag")) {
        // USE NEWLY GENERATED KEY for this unique user...
        const newUserKey = firebase
          .database()
          .ref()
          .child("responses/" + this.s_id)
          .push().key;
        this.response["respondent"] = this.respondent_name
          ? this.respondent_name.value != ""
            ? this.respondent_name.value
            : newUserKey
          : newUserKey;

        if (connectedToFirebaseFlag) {
          try {
            firebase
              .database()
              .ref("/responses/" + this.s_id + "/" + newUserKey)
              .set(this.response, function (error) {
                if (error) {
                  console.log(
                    "Not successful pushing response to list of responses." +
                      error
                  );
                  loadingSubmitting.dismiss();
                  that.navCtrl.pop();
                } else {
                  console.log("Successfully added to responses!");
                  loadingSubmitting.dismiss();
                  that.configService.displayToast(
                    "Success! Response recorded."
                  );
                  that.navCtrl.pop();
                }
              });
          } catch (e) {
            console.log(e);
            loadingSubmitting.dismiss();
            this.navCtrl.pop();
          }
        } else {
          this.saveToLocalDB(this.response);
          loadingSubmitting.dismiss();
        }
      } else {
        // store response to firebase
        if (connectedToFirebaseFlag) {
          try {
            const myId = this.fire.auth.currentUser
              ? this.fire.auth.currentUser.uid
              : this.currUser;
            firebase
              .database()
              .ref("/responses/" + this.s_id + "/" + myId)
              .set(this.response, function (error) {
                if (error) {
                  console.log(
                    "Not successful pushing response to list of responses." +
                      error
                  );
                  that.showSubmitError();
                } else {
                  bindSelf.notification["s_status"] = "completed";
                  firebase
                    .database()
                    .ref(
                      "/notifications/" +
                        bindSelf.thisSurvey["author_id"] +
                        "/surveyNotifs/" +
                        newNotifKey
                    )
                    .set(bindSelf.notification);
                  console.log("Successfully added to responses!");

                  // update survey status in notifications
                  that.UpdateNotifSurveyStatus();
                  // update USER_SURVEYS invitation to COMPLETED
                  that.UpdateInvitationStatus();
                  // pop this page
                  that.navCtrl.pop();
                }
                loadingSubmitting.dismiss();
              });
          } catch (e) {
            console.log(e);
            loadingSubmitting.dismiss();
          }
        } else {
          this.showNetworkError();
          loadingSubmitting.dismiss();
        }
      }
    }); //endof loadingCtrl
  }

  sendMessage() {
    console.log("Redirecting to chat...");
    this.navCtrl.push(ChatPage, {
      chatmate: this.author_name,
      author_id: this.author_id,
      uid: this.fire.auth.currentUser.uid,
    });
  }

  ionViewWillEnter() {
    console.log("entering anwer-survey page ...");
    this.viewOnly = this.navParams.get("viewOnly")
      ? this.navParams.get("viewOnly")
      : false;
  }

  ionViewWillLeave() {
    console.log("leaving anwer-survey page ...");
  }
}
