import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the QuestionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-question',
  templateUrl: 'question.html',
})
export class QuestionPage {
	public type;
 	constructor(public navCtrl: NavController, public navParams: NavParams, public view: ViewController) {
  		this.type = this.navParams.get('type');
  }

  	ionViewDidLoad() {
    	console.log('ionViewDidLoad QuestionPage');
  	}
    
  closeQuestionModal() {
  	this.view.dismiss();
  }

}