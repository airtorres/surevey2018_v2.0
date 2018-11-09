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
  @ViewChild('firstOpt_multipleChoice') firstOpt_multipleChoice;
  @ViewChild('firstOpt_checkbox') firstOpt_checkbox;
  @ViewChild('firstOpt_dropdown') firstOpt_dropdown;

  thisQuestion = {
    'type' : '',
    'message': '',
    'options' : [],
    'isRequired': false
  };

	public type;
  public anArray = [];
  isRequired;

 	constructor(public navCtrl: NavController, public navParams: NavParams, public view: ViewController) {
  		this.type = this.navParams.get('type');

      if(this.navParams.get('question_data')){
        console.log(this.navParams.get('question_data'));
        this.thisQuestion = this.navParams.get('question_data');
        this.type = this.thisQuestion['type'];

        console.log(this.thisQuestion['options'].length);

        for ( var opt = 0; opt < this.thisQuestion['options'].length; opt++ ){
          if( opt != 0){
            var val = {'value': this.thisQuestion['options'][opt]};
            this.anArray.push(val);
          }
        }

        console.log(this.anArray);
      }
      
  }

	ionViewDidLoad() {
  	console.log('ionViewDidLoad QuestionPage');
	}

  addQuestion(){
    console.log("question: "+ this.question.value);

    this.thisQuestion['type'] = this.type;
    this.thisQuestion['message'] = (this.question ? this.question.value : "Missing Question");
    this.thisQuestion['isRequired'] = this.isRequired;

    if (this.type == 'multipleChoice' || this.type == 'checkbox' || this.type == 'dropdown'){
      console.log('this.anArray', this.anArray);

      if (this.type == 'multipleChoice'){
        this.thisQuestion['options'][0] = this.firstOpt_multipleChoice.value;
      }
      else if (this.type == 'checkbox'){
        this.thisQuestion['options'][0] = this.firstOpt_checkbox.value;
      }
      else if (this.type == 'dropdown'){
        this.thisQuestion['options'][0] = this.firstOpt_dropdown.value;
      }

      for( var opt in this.anArray){
        this.thisQuestion['options'].push(this.anArray[opt]['value']);
      }

    }
    else if ( this.type == 'time'){}
    else if ( this.type == 'date'){}
    else {}

    this.navCtrl.getPrevious().data.question_data = (this.thisQuestion? this.thisQuestion : null);
    this.navCtrl.getPrevious().data.push_flag = true;
    if(this.navParams.get('question_data')){
      this.navCtrl.getPrevious().data.replace_flag = true;
      this.navCtrl.getPrevious().data.qID = this.navParams.get('qID_fromEdit');
    }
    this.navCtrl.pop();
  }
    
  closeQuestionModal() {
    this.navCtrl.getPrevious().data.push_flag = false;
  	this.view.dismiss();
  }

  addMoreOption(){
    // somethings wrong sa pagpush
    this.anArray? this.anArray.push({'value':''}):'';
  }

  public ionViewWillLeave() {
    console.log("leaving question page ...");

    this.anArray = [];

    this.thisQuestion = {
      'type' : '',
      'message': '',
      'options' : [],
      'isRequired': false
    };
  }

}