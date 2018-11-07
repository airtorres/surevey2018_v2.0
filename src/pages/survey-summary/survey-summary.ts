import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SendInvitePage } from '../send-invite/send-invite';
import { CreateSurveyPage } from '../create-survey/create-survey';

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

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage) {
    this.thisSurvey = navParams.get('item');

    this.title = this.thisSurvey['title'];
    this.isActive = this.thisSurvey['isActive'];
    this.s_id = this.thisSurvey['id'];

    var date = this.thisSurvey['created_at'];
    date = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.created_date =  date;

    date = this.thisSurvey['updated_at'];
    date = date? ((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear()):null;
    this.updated_date =  date;

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
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

  deleteSurvey(){
    this.storage.get('surveys').then((s) => {
      if (s){
         for ( var surv_id in s['surveys']){
            // console.log(s['surveys'][surv]);

            if( surv_id == this.s_id){
              s['surveys'].splice(surv_id, 1);
              this.storage.set('surveys', s).then((val) =>{});

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

}