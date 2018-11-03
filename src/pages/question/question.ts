import { Component, ViewChild } from '@angular/core';
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
  @ViewChild('question') question;
  @ViewChild('answer') answer;

  thisQuestion = {
    'type' : '',
    'message': '',
    'options' : []
  };

	public type;
  public anArray = [];

 	constructor(public navCtrl: NavController, public navParams: NavParams, public view: ViewController) {
  		this.type = this.navParams.get('type');
  }

	ionViewDidLoad() {
  	console.log('ionViewDidLoad QuestionPage');
	}

  addQuestion(){
    console.log("question: "+ this.question.value);

    this.thisQuestion['type'] = this.type;
    this.thisQuestion['message'] = (this.question ? this.question.value : "Missing Question");

    if (this.type == 'multipleChoice' || this.type == 'checkbox' || this.type == 'dropdown'){
      console.log('this.anArray', this.anArray);

      for( var opt in this.anArray){
        this.thisQuestion['options'].push(this.anArray[opt]['value']);
      }

    }
    else if ( this.type == 'time'){}
    else if ( this.type == 'date'){}
    else {}

    this.navCtrl.getPrevious().data.question_data = (this.thisQuestion? this.thisQuestion : null);
    this.navCtrl.pop();
  }
    
  closeQuestionModal() {
  	this.view.dismiss();
  }

  addMoreOption(){
    this.anArray? this.anArray.push({'value':''}):'';
  }

}