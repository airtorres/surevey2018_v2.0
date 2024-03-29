import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ActionSheetController,
  AlertController,
  LoadingController,
} from "ionic-angular";

import { SurveySummaryPage } from "../survey-summary/survey-summary";
import { AnswerSurveyPage } from "../answer-survey/answer-survey";
import { EditDraftPage } from "../edit-draft/edit-draft";

import { ConfigurationProvider } from "../../providers/configuration/configuration";

import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import "firebase/database";
import { Storage } from "@ionic/storage";

/**
 * Generated class for the SurveyListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-survey-list",
  templateUrl: "survey-list.html",
})
export class SurveyListPage {
  surveyList = "all";
  item;

  currUser;
  surveys = {};

  mySurveys = [];
  mySurveys_ids = [];

  survey_invites = [];
  survey_invites_ids = [];

  invite_status = {};

  drafts = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public actionSheetController: ActionSheetController,
    private alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public configService: ConfigurationProvider,
    private fire: AngularFireAuth,
    private storage: Storage
  ) {
    this.storage.get("currentUser").then((x) => {
      this.currUser = x;
    });

    this.storage.get("drafts").then((d) => {
      if (d) {
        this.drafts = d;
      }
    });

    console.log(this.drafts);
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad SurveyListPage");
  }

  gotoDraftPage(item) {
    this.navCtrl.push(EditDraftPage, { item: item, draftFlag: true });
  }

  gotoSummary(item) {
    this.navCtrl.push(SurveySummaryPage, { item: item });
  }

  gotoRespondentView(item) {
    // check for Firebase connection
    const connectedToFirebaseFlag = this.configService.isConnectedToFirebase();

    if (
      connectedToFirebaseFlag &&
      this.invite_status[item["id"]] != "completed"
    ) {
      this.navCtrl.push(AnswerSurveyPage, { item: item, viewOnly: false });
    } else if (this.invite_status[item["id"]] != "completed") {
      this.configService.showSimpleConnectionError();
    }
  }

  loadSurveysFromLocalDB() {
    this.storage.get("mySurveys").then((mySurv) => {
      if (mySurv) {
        this.mySurveys = mySurv;
      }
    });
    this.storage.get("survey_invites").then((invites) => {
      if (invites) {
        this.survey_invites = invites;
      }
    });
    this.storage.get("invite_status").then((status) => {
      if (status) {
        this.invite_status = status;
      }
    });
  }

  fetchSurveys() {
    let i;
    let surv = [];

    firebase
      .database()
      .ref("/user_surveys/" + this.fire.auth.currentUser.uid + "/surveylist")
      .on("value", (survSnapshot) => {
        this.mySurveys_ids = survSnapshot.val();

        this.mySurveys = [];
        for (i in this.mySurveys_ids) {
          surv = this.configService.getSurveyData(this.mySurveys_ids[i]);
          if (surv) {
            surv["type"] = "";
            surv["type"] = "mySurvey";
            surv["num_responses"] = 0;
            surv["num_responses"] = this.configService.getNumResponses(
              this.mySurveys_ids[i]
            );

            this.mySurveys.push(surv);
          }
        }

        this.mySurveys.reverse();
      });

    firebase
      .database()
      .ref("/user_surveys/" + this.fire.auth.currentUser.uid + "/invitations")
      .on("value", (survSnapshot) => {
        const all_invitations = survSnapshot.val();

        this.survey_invites_ids = [];
        for (const invit in all_invitations) {
          this.survey_invites_ids.push(all_invitations[invit]["s_id"]);
          this.invite_status[invit] = all_invitations[invit]["status"];
        }

        this.survey_invites = [];
        for (i in this.survey_invites_ids) {
          surv = this.configService.getSurveyData(this.survey_invites_ids[i]);
          if (surv) {
            surv["type"] = "";
            surv["type"] = "invites";
            this.survey_invites.push(surv);
          }
        }

        if (this.survey_invites && this.invite_status) {
          this.survey_invites.reverse();
        }
      });

    const connectedToFirebaseFlag = this.configService.isConnectedToFirebase();
    if (!connectedToFirebaseFlag) {
      // getting the survey data from localDB if not connected to Firebase
      this.loadSurveysFromLocalDB();
    }
  }

  confirmDeleteSurvey(item) {
    const surveyId = item["id"];
    if (this.configService.isConnectedToFirebase()) {
      this.configService.deleteSurvey(surveyId);
    } else {
      this.configService.showSimpleConnectionError();
    }
  }

  showDeleteConfirmationAlert(item) {
    let msg = "Are you sure to delete this survey?";
    if (item["type"]) {
      if (item["type"] == "mySurvey") {
        console.log("Deleting my survey...");
        msg = "Are you sure to delete this survey?";
      } else if (item["type"] == "invites") {
        msg = "Are you sure to delete this Invitation?";
      }
    } else {
      msg = "Are you sure to delete this Draft?";
    }

    const s_title = item["title"] ? item["title"] : "Unkown Survey";

    const alert = this.alertCtrl.create({
      title: msg,
      message: s_title,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked.");
          },
        },
        {
          text: "Delete",
          handler: () => {
            if (item["type"]) {
              if (item["type"] == "mySurvey") {
                console.log("Deleting my survey...");
                this.confirmDeleteSurvey(item);
              } else if (item["type"] == "invites") {
                console.log("Deleting survey invitations...");
                this.deleteSurveyInvitation(item);
              }
            } else {
              // assume draft item
              console.log("Deleting my drafts...");
              this.deleteDraft(item);
            }
          },
        },
      ],
    });
    alert.present();
  }

  deleteSurveyInvitation(item) {
    const loading = this.loadingCtrl.create({
      content: "Deleting invitation...",
    });

    loading.present().then(() => {
      if (this.configService.isConnectedToFirebase()) {
        this.configService.deleteSurveyInvitation(item["id"]);
        this.configService.deleteSentInvitationNotifFromSurveyList(item["id"]);
      } else {
        this.configService.showSimpleConnectionError();
      }

      this.ionViewWillEnter();
      loading.dismiss();
    });
  }

  deleteDraft(item) {}

  showItemOption(item) {
    const actionSheet = this.actionSheetController.create({
      buttons: [
        {
          text: "Delete",
          role: "destructive",
          icon: "trash",
          handler: () => {
            this.showDeleteConfirmationAlert(item);
          },
        },
        {
          text: "Cancel",
          icon: "close",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });
    actionSheet.present();
  }

  public ionViewDidEnter() {
    console.log("Did Enter survey-list ...");
    this.fetchSurveys();
  }

  public ionViewWillEnter() {
    console.log("entering survey-list ...");
  }
}
