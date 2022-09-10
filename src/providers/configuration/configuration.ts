import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import {
  ToastController,
  AlertController,
  LoadingController,
} from "ionic-angular";

import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import "firebase/database";

import { Storage } from "@ionic/storage";

/*
  Generated class for the ConfigurationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ConfigurationProvider {
  built_in_templates = [];
  userData = {};
  username = "";
  connectedToFirebaseFlag = false;
  mysurveylist = [];

  constructor(
    public http: HttpClient,
    private fire: AngularFireAuth,
    private storage: Storage,
    public toastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    console.log("Hello ConfigurationProvider Provider");

    const that = this;
    firebase
      .database()
      .ref("/")
      .child(".info/connected")
      .on("value", function (connectedSnap) {
        if (connectedSnap.val() === true) {
          console.log("Connected to Firebase.");
          that.connectedToFirebaseFlag = true;
        } else {
          console.log("Error connecting to Firebase.");
          that.connectedToFirebaseFlag = false;
        }
      });
  }

  displayToast(msg) {
    const toast = this.toastCtrl.create({
      message: msg,
      duration: 2000,
      position: "bottom",
    });

    toast.present();
  }

  showSimpleAlert(thisTitle, msg) {
    const alert = this.alertCtrl.create({
      title: thisTitle,
      message: msg,
      buttons: ["OK"],
    });
    alert.present();
  }

  showSimpleConnectionError() {
    const alert = this.alertCtrl.create({
      title: "Connection Timeout",
      message: "You must be connected to the internet.",
      buttons: ["OK"],
    });
    alert.present();
  }

  transformAuthorName(authorId, email) {
    let name = email;
    const user: firebase.database.Reference = firebase
      .database()
      .ref("/users/" + authorId);
    user.on("value", (userSnapshot) => {
      const u = userSnapshot.val();

      if (u) {
        const firstname = u["first_name"];
        const lastname = u["last_name"];

        if (u["first_name"] != null && u["last_name"] != null) {
          name = firstname + " " + lastname;
        }
      }
    });

    if (name == " ") {
      name = email;
    }

    return name;
  }

  transformAuthorNameNoEmail(authorId) {
    let name = "";
    let email = "";
    const user: firebase.database.Reference = firebase
      .database()
      .ref("/users/" + authorId);
    user.on("value", (userSnapshot) => {
      const u = userSnapshot.val();

      if (u) {
        email = u["email"];
        const firstname = u["first_name"];
        const lastname = u["last_name"];

        if (u["first_name"] != null && u["last_name"] != null) {
          name = firstname + " " + lastname;
        }
      }
    });

    if (name == " ") {
      name = email;
    }

    return name;
  }

  transformDate(isoDate) {
    const date = new Date(isoDate);
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    const dateVal = month + " " + day + ", " + year;

    if (dateVal) {
      return dateVal;
    } else {
      return "No Date Specified";
    }
  }

  transformTime(isoDate) {
    const date = new Date(isoDate);
    const time = date.toTimeString().split(" ")[0];

    return time;
  }

  transformDateNumFormat(isoDate) {
    let dateVal = "No Date Specified";
    if (isoDate) {
      const date = new Date(isoDate);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();

      dateVal = month + "/" + day + "/" + year;

      if (dateVal) {
        return dateVal;
      } else {
        return "No Date Specified";
      }
    } else {
      return "No Date Specified";
    }
  }

  isConnectedToFirebase() {
    return this.connectedToFirebaseFlag;
  }

  getUserDataFromLocalDB() {
    this.storage.get("thisUserData").then((userData) => {
      if (userData) {
        this.userData = userData;
      }
    });
    return this.userData;
  }

  getBuiltInTemplatesFromLocalDB() {
    try {
      this.storage.get("built_in_templates").then((templates) => {
        if (templates) {
          this.built_in_templates = templates;
        }
      });
    } catch (e) {
      console.log(e);
    }
  }

  getBuiltInTemplates() {
    if (this.isConnectedToFirebase()) {
      const templateRef: firebase.database.Reference = firebase
        .database()
        .ref("/built_in_templates");
      templateRef.on("value", (templateSnapshot) => {
        this.built_in_templates = [];
        const tempRef = templateSnapshot.val();
        for (const temp in tempRef) {
          this.built_in_templates.push(tempRef[temp]);
        }
        this.storage.set("built_in_templates", this.built_in_templates);
      });
    } else {
      this.getBuiltInTemplatesFromLocalDB();
    }
    return this.built_in_templates;
  }

  saveSurveyData(surveyData, postKey) {
    firebase
      .database()
      .ref("/surveys/" + postKey)
      .set(surveyData, function (error) {
        if (error) {
          console.log("Not successful pushing ID to surveys." + error);
        } else {
          console.log("Successfully added the surveyID to surveys!");
        }
      });
  }

  deleteSurveyFromSurveyList(surveyId) {
    const mySurvs = this.getUserSurveysList(this.fire.auth.currentUser.uid);

    const bindSelf = this;
    for (const index in mySurvs) {
      if (surveyId == mySurvs[index]) {
        firebase
          .database()
          .ref(
            "/user_surveys/" +
              this.fire.auth.currentUser.uid +
              "/surveylist/" +
              index
          )
          .remove(function (error) {
            if (error) {
              console.log("Not able to delete survey on user_survey.");
            } else {
              console.log("Survey Deleted on user_survey!");
              bindSelf.displayToast("Survey Deleted!");
            }
          });
        break;
      }
    }
  }

  deleteSurvey(surveyId) {
    const loading = this.loadingCtrl.create({
      content: "Deleting survey...",
    });

    loading.present().then(() => {
      const bindSelf = this;
      firebase
        .database()
        .ref("/surveys/" + surveyId)
        .remove(function (error) {
          if (error) {
            console.log("Not able to delete survey on list");
            loading.dismiss();
          } else {
            console.log("Survey Deleted on survey List!");
            bindSelf.deleteSurveyFromSurveyList(surveyId);
            loading.dismiss();
          }
        });

      // deleting all responses for this survey
      firebase
        .database()
        .ref("/responses/" + surveyId)
        .remove(function (error) {
          if (error) {
            console.log("Not able to delete responses.");
          } else {
            console.log("Responses for this survey are deleted!");
          }
        });
    });

    // this.deleteSentInvitation(surveyId);
  }

  deleteSurveyInvitation(surveyId) {
    const bindSelf = this;
    firebase
      .database()
      .ref(
        "/user_surveys/" +
          this.fire.auth.currentUser.uid +
          "/invitations/" +
          surveyId
      )
      .remove(function (error) {
        if (error) {
          console.log("Not able to delete invitation.");
        } else {
          console.log("Survey ID from invitation removed!");
          bindSelf.displayToast("Invitation Deleted!");
        }
      });
  }

  deleteSentInvitation(surveyId) {
    // iterate to look for all invitation from user_surveys
    // OR, handle lang ang null valued survey sa receipient.
  }

  deleteSentInvitationNotifFromSurveyList(surveyId) {
    const notifInvites = this.getNotifSurveyInvites();
    for (const n in notifInvites) {
      if (notifInvites[n]["s_id"] == surveyId) {
        firebase
          .database()
          .ref(
            "/notifications/" +
              this.fire.auth.currentUser.uid +
              "/surveyNotifs/" +
              notifInvites[n]["notifId"]
          )
          .remove(function (error) {
            if (error) {
              console.log("Not able to delete invitation from notif.");
            } else {
              console.log("Survey ID from notif removed!");
            }
          });
      }
    }
  }

  getNotifSurveyInvites() {
    const invites = [];
    const notifinviteRef: firebase.database.Reference = firebase
      .database()
      .ref(
        "/notifications/" + this.fire.auth.currentUser.uid + "/surveyNotifs/"
      );
    notifinviteRef.on("value", (notifInviteSnap) => {
      const notifInvite = notifInviteSnap.val();
      if (notifInvite) {
        for (const ni in notifInvite) {
          if (
            notifInvite[ni]["type"] == "invitation" &&
            notifInvite[ni]["s_status"] == "pending"
          ) {
            invites.push(notifInvite[ni]);
          }
        }
      }
    });
    return invites;
  }

  getSurveyData(surveyId) {
    let thisSurvey = [];
    const survey: firebase.database.Reference = firebase
      .database()
      .ref("/surveys/" + surveyId);
    survey.on("value", (surveySnapshot) => {
      thisSurvey = surveySnapshot.val();
    });
    return thisSurvey;
  }

  getUserSurveysAllList(userId) {
    let all = [];
    const surv: firebase.database.Reference = firebase
      .database()
      .ref("/user_surveys/" + userId);
    surv.on("value", (survSnapshot) => {
      all = survSnapshot.val();
    });
    return all;
  }

  getUserSurveysList(userId) {
    let mySurvs = this.mysurveylist;
    const surv: firebase.database.Reference = firebase
      .database()
      .ref("/user_surveys/" + userId + "/surveylist");
    surv.on("value", (survSnapshot) => {
      mySurvs = survSnapshot.val();
      this.mysurveylist = mySurvs ? mySurvs : this.mysurveylist;
    });
    return mySurvs;
  }

  getUserInvitationsList(userId) {
    let invits = [];
    const surv: firebase.database.Reference = firebase
      .database()
      .ref("/user_surveys/" + userId + "/invitations");
    surv.on("value", (survSnapshot) => {
      invits = survSnapshot.val();
    });
    return invits;
  }

  getNumResponses(surveyId) {
    let num_responses = 0;
    const resp: firebase.database.Reference = firebase
      .database()
      .ref("/responses/" + surveyId);
    resp.on("value", (respSnapshot) => {
      if (respSnapshot.val()) {
        num_responses = respSnapshot.numChildren();
      }
    });
    return num_responses;
  }

  updateSurveyStatus(surveyId, status) {
    firebase
      .database()
      .ref("/surveys/" + surveyId + "/isActive")
      .set(status, function (error) {
        if (error) {
          console.log("Cannot update survey status." + error);
        } else {
          console.log("Survey status updated!");
        }
      });
  }

  updateUserSurveyList(newList) {
    firebase
      .database()
      .ref("/user_surveys/" + this.fire.auth.currentUser.uid + "/surveylist")
      .set(newList, function (error) {
        if (error) {
          console.log("Not successful pushing ID to user-survey list." + error);
        } else {
          console.log("Successfully added the surveyID to user-survey list!");
        }
      });
  }

  // ================= CONFIGURING COUNTRY_STATE_CITY ====================================
  getCountryStateCityDataFromLocalDB() {
    let countries = [];
    try {
      this.storage.get("country_state_city").then((data) => {
        if (data) {
          countries = data;
        }
      });
    } catch (e) {
      console.log(e);
    }
    return countries;
  }

  getCountryStateCityDataFromFirebase() {
    let countries = [];
    const surv: firebase.database.Reference = firebase
      .database()
      .ref("/country_state_city/");
    surv.once("value", (countriesSnapshot) => {
      countries = countriesSnapshot.val();
    });

    // savetoLocalDB
    this.storage.set("country_state_city", countries);

    return countries;
  }

  getCountryStateCityData() {
    if (this.isConnectedToFirebase()) {
      return this.getCountryStateCityDataFromFirebase();
    } else {
      return this.getCountryStateCityDataFromLocalDB();
    }
  }

  getAllCountryNames() {
    const countries = this.getCountryStateCityData();
    const countryNames = [];
    for (const c in countries) {
      countryNames.push(c);
    }
    return countryNames;
  }

  // returns details of states (includes cities)
  getAllStates() {
    const states = [];
    const all = this.getCountryStateCityData();
    for (const country in all) {
      for (const state in all[country]) {
        const temp = {};
        temp[state] = "";
        temp[state] = all[country];
        states.push(temp);
      }
    }
    return states;
  }

  // returns statenames only
  getAllStateNames() {
    const states = [];
    const all = this.getCountryStateCityData();
    for (const country in all) {
      for (const state in all[country]) {
        states.push(state);
      }
    }
    return states;
  }

  // returns details of states (includes cities); for given country
  getStatesOf(countryId) {
    let states = [];
    if (countryId && countryId != "Anywhere") {
      if (this.isConnectedToFirebase()) {
        const s: firebase.database.Reference = firebase
          .database()
          .ref("/country_state_city/" + countryId);
        s.once("value", (statesSnapshot) => {
          if (statesSnapshot.val()) {
            const temp = statesSnapshot.val();
            states = temp;
          }
        });
        return states;
      } else {
        const all = this.getCountryStateCityDataFromLocalDB();
        if (all[countryId]) {
          states = all[countryId];
        }
        return states;
      }
    } else if (countryId == "Anywhere") {
      return this.getAllStates();
    } else {
      console.log("Not a valid country.");
      return states;
    }
  }

  // returns state names of the given country
  getStateNamesOf(countryId) {
    let statenames = [];
    if (countryId == "Anywhere") {
      statenames = this.getAllStateNames();
    } else if (!countryId) {
      console.log("Not a valid country.");
    } else {
      for (const state in this.getStatesOf(countryId)) {
        statenames.push(state);
      }
    }
    return statenames;
  }

  getAllCityNames() {
    const cities = [];
    const all = this.getCountryStateCityData();
    for (const country in all) {
      for (const state in all[country]) {
        for (const cityIdx in all[country][state]) {
          cities.push(all[country][state][cityIdx]);
        }
      }
    }
    return cities;
  }

  getCitiesOf(stateId, countryId) {
    const cities = [];
    if (stateId && countryId) {
      if (countryId == "Anywhere") {
        return this.getAllCityNames();
      } else if (stateId == "Anywhere") {
        const states = this.getStatesOf(countryId);
        for (const s in states) {
          for (const city in states[s]) {
            cities.push(states[s][city]);
          }
        }
      } else {
        const all = this.getCountryStateCityData();
        if (all[countryId]) {
          return all[countryId][stateId];
        }
      }
    } else {
      console.log("Invalid country or state.");
    }
    return cities;
  }

  // ============= ENDOF COUNTRY_STATE_CITY ==========================================
}
