import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { QuestionPage } from '../question/question';

import { Storage } from '@ionic/storage';

/**
 * Generated class for the TemplatesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-templates',
  templateUrl: 'templates.html',
})
export class TemplatesPage {
	@ViewChild('fab') fab;
	@ViewChild('title') title;
  	@ViewChild('description') description;
  	
	public surveyTitle;

	surveys = {};
	survey = {
	    'title':'untitled survey',
	    'description':'No Description to show.',
	    'author': '',
	    'created_at': new Date(),
	    'updated_at': new Date(),
	    'end_date': null,
	    'isActive': true, //true/false
	    'questions': []
	  };
	questions = [];

	currUser;
	survey_id;


	constructor(public navCtrl: NavController, public navParams: NavParams,
		private storage: Storage) {

		this.surveyTitle = this.navParams.get('surveyTitle');

		// load this survey template
		this.storage.get("built_in_templates").then( temp => {
			for (var t in temp){
				if( temp[t]['title'] == this.surveyTitle){
					this.title.value = temp[t]['title'];
					this.description.value = temp[t]['description'];
					this.questions = temp[t]['questions'];

					this.survey['title'] = temp[t]['title'];
					this.survey['description'] = temp[t]['description'];
					this.survey['questions'] = temp[t]['questions'];
					break;
				}
			}
		});

		this.storage.get("surveys").then(value => {
	        this.surveys = value;
	    });

		this.storage.get('currentUser').then(x =>{
	      this.currUser = x;
	    });
	}

	ionViewDidLoad() {
	    console.log('ionViewDidLoad TemplatesPage');
	}

  	addQuestion(questionType) {
  		let data = {
  			type: questionType
  		}
  		console.log(data);

	  	this.fab.close();
	}

	saveChanges(){
		this.survey?this.survey['title'] = (this.title.value? this.title.value:'Untitled Survey'):'';
		this.survey?this.survey['description'] = (this.description.value? this.description.value:'No description'):'';
		this.survey['questions'] = this.questions;
		this.survey['author'] = this.currUser;

		console.log(this.survey);

		// there should be no survey editing functions here,
		// because the editing will be done in create-survey page

		if(this.surveys){
	        JSON.parse(this.surveys['surveys'].push(this.survey));
	    }
	    else{
	      this.surveys = {'surveys': ''};
	      this.surveys['surveys'] = [this.survey];
	    }

	    // getting the survey id
	    for ( var this_surv_id in this.surveys['surveys']){
		    if( JSON.stringify(this.survey) == JSON.stringify(this.surveys['surveys'][this_surv_id])){
		    	this.survey_id = this_surv_id;
		    	break;
		    }
	    }

	    // saving survey id to user's surveys list
    	this.storage.get('users').then((u) => {
	        for ( var i in u['users']){
		        if (u['users'][i]['email'] == this.currUser){
			        u['users'][i]['surveys'].push(this.survey_id);
			        // update users
			        this.storage.set('users', u).then((data) => {
			        	return
			        });
	            }
	        }
    	});

    	this.storage.set('surveys', this.surveys).then((val) =>{});

	    // redirect to survey-list: showing all surveys
	    this.navCtrl.pop();
	    this.navCtrl.parent.select(1);
	}

	deleteQuestion(q_id){
		this.survey['questions'].splice(q_id,1);
	}

    editQuestion(q_id){
    	this.navCtrl.push(QuestionPage, {question_data: this.survey['questions'][q_id], qID_fromEdit: q_id});
    }

}
