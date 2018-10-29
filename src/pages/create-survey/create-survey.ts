import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { QuestionPage } from '../question/question';
/**
 * Generated class for the CreateSurveyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-create-survey',
  templateUrl: 'create-survey.html',
})
export class CreateSurveyPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateSurveyPage');
  }

  addQuestion(questionType) {
  	let data = {
  		type: questionType
  	}
  	console.log(data);

  	this.navCtrl.push(QuestionPage, data);
  }

}
