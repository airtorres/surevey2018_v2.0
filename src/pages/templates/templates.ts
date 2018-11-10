import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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

	survey = {};
	questions = [];


	constructor(public navCtrl: NavController, public navParams: NavParams,
		private storage: Storage) {

		this.surveyTitle = this.navParams.get('surveyTitle');

		// load this survey template
		this.storage.get("built_in_templates").then( temp => {
			for (var t in temp){
				if( temp[t]['title'] == this.surveyTitle){
					this.survey = temp[t];
					this.title.value = temp[t]['title'];
					this.description.value = temp[t]['description'];

					this.questions = this.survey['questions'];
					break;
				}
			}
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
		console.log(this.title.value);
		console.log(this.description.value);
	}

	deleteQuestion(){

	}

    editQuestion(){

    }

}
