import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { SurveySummaryPage } from '../survey-summary/survey-summary';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the SurveyListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-survey-list',
  templateUrl: 'survey-list.html',
})
export class SurveyListPage {
	surveyList: string = "all";
  item;

  currUser;
  surveys = {};

  mySurveys = [];
  mySurveys_ids = [];

  survey_invites = [];
  survey_invites_ids = [];

  // mySurveys + survey invites
  all_surveys = [];
	
  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage) {

    this.storage.get('currentUser').then(x =>{
      this.currUser = x;
    });

    this.storage.get("surveys").then(value => {
      this.surveys = value;
    
      this.storage.get('users').then(u =>{
        for ( var i in u['users']){
          if (u['users'][i]['email'] == this.currUser){
            this.mySurveys_ids = u['users'][i]['surveys'];

            var invitations = u['users'][i]['invitations'];
            for ( var inv in invitations){
              this.survey_invites_ids.push(u['users'][i]['invitations'][inv]['s_id']);
            }

            console.log(this.mySurveys_ids);
            console.log(this.survey_invites_ids);
          }
        }

        var id;
        for( var x in this.mySurveys_ids){
          // console.log(this.surveys['surveys'][id]);
          id = this.mySurveys_ids[x];
          this.surveys['surveys'][id]['id'] = '';
          this.surveys['surveys'][id]['id'] = id; // id is needed to be passed later
          this.surveys['surveys'][id]['type'] = '';
          this.surveys['surveys'][id]['type'] = 'mySurvey';
          this.mySurveys.push(this.surveys['surveys'][id]);
          this.all_surveys.push(this.surveys['surveys'][id]);
        }

        for ( var y in this.survey_invites_ids){
          id = this.survey_invites_ids[y];
          this.surveys['surveys'][id]['id'] = '';
          this.surveys['surveys'][id]['id'] = id; // id is needed to be passed later
          this.surveys['surveys'][id]['type'] = '';
          this.surveys['surveys'][id]['type'] = 'invites';
          this.survey_invites.push(this.surveys['surveys'][id]);
          this.all_surveys.push(this.surveys['surveys'][id]);
        }
      });
    });
  }

  ionViewDidLoad() {
    console.log(this.all_surveys);
    console.log('ionViewDidLoad SurveyListPage');
  }

  gotoSummary(item){
  	this.navCtrl.push(SurveySummaryPage, {'item' : item});
  }

}
