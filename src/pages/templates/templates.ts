import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

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
	public surveyTitle;

	constructor(public navCtrl: NavController, public navParams: NavParams) {
		this.surveyTitle = this.navParams.get('surveyTitle');
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

}
