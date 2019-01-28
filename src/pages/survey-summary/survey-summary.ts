import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';

import { SendInvitePage } from '../send-invite/send-invite';
import { CreateSurveyPage } from '../create-survey/create-survey';
import { ResultsPage } from '../results/results';
import { AnswerSurveyPage } from '../answer-survey/answer-survey';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the SurveySummaryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-survey-summary',
  templateUrl: 'survey-summary.html',
})
export class SurveySummaryPage {
  isActive;
  thisSurvey;
  title;
  s_id;
  created_date;
  updated_date;

  currUser;
  responses;
  thisResponses = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage,
    private alertCtrl: AlertController) {
    this.thisSurvey = navParams.get('item');

    this.title = this.thisSurvey['title'];
    this.isActive = this.thisSurvey['isActive'];
    this.s_id = this.thisSurvey['id'];

    var date = new Date(this.thisSurvey['created_at']);
    date = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.created_date =  date;

    date = new Date(this.thisSurvey['updated_at']);
    date = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.updated_date =  date;

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    this.storage.get('responses').then(res => {
      this.responses = res;
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveySummaryPage');
  }

  gotoSendInvitePage(){
  	this.navCtrl.push(SendInvitePage, {s_id: this.s_id});
  }

  gotoEdit(){
    this.navCtrl.push(CreateSurveyPage, {thisSurvey: this.thisSurvey, s_id: this.s_id});
  }

  gotoRespondentView(){
    this.navCtrl.push(AnswerSurveyPage, {'item' : this.thisSurvey, 'diff_respondent_flag': true});
  }

  gotoResultsPage(){
    // generate results from local responses
    if (this.responses){
      for( var r in this.responses['responses']){
        if (this.responses['responses'][r]['survey_id'] == this.s_id) {
          this.thisResponses.push(this.responses['responses'][r]);
        }
      }
    }

    console.log(this.thisResponses);

    this.navCtrl.push(ResultsPage, {s_id: this.s_id, responses: this.thisResponses});
  }

  confirmDeleteSurvey(){
    this.storage.get('surveys').then((s) => {
      if (s){
         for ( var surv_id in s['surveys']){
            // console.log(s['surveys'][surv]);

            if( surv_id == this.s_id){

              // DO NOT DELETE SURVEY on surveys? The ids affecting on the surveys listed on the user
              // TRADEOFFS: Storage VS Speed (of updating IDs on ALL 'surveys' and 'invitations' array)
              // s['surveys'].splice(surv_id, 1);
              // this.storage.set('surveys', s).then((val) =>{});

              // removing survey_ids in users
              this.storage.get('users').then((u) => {
                for ( var i in u['users']){
                  if (u['users'][i]['email'] == this.currUser){
                    for ( var survs in u['users'][i]['surveys']){
                      if( u['users'][i]['surveys'][survs] == this.s_id){
                        u['users'][i]['surveys'].splice(survs, 1);
                      }
                    }
                  }
                  else{
                    for ( var invs in u['users'][i]['invitations']){
                      if( u['users'][i]['invitations'][invs] == this.s_id){
                        u['users'][i]['invitations'].splice(invs, 1);
                      }
                    }
                  }
                }

                // update users
                this.storage.set('users', u).then((data) => {
                  return
                });
              });


              break;
            }
         }
        }
    });

    this.navCtrl.pop();
  }

  deleteSurvey(){
    let alert = this.alertCtrl.create({
      title: 'Warning',
      message: 'Are you sure to delete this survey?',
      buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked. Do not delete survey.');
        }
      },
      {
        text: 'Delete',
        handler: () => {
          console.log('deleting survey ...');
          this.confirmDeleteSurvey();
        }
      }
    ]
    });
    alert.present();
  }

  public ionViewWillLeave(){
    console.log("leaving survey-summary page ...");
    // this.navCtrl.pop();
  }

}