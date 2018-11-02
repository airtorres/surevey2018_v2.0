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
      // getting the provided options
      var cls = (this.type + '_options');
      var opts = document.getElementsByClassName(cls);
      var opt = document.getElementById('opt_id');

      // HOW CAN I GET THE VALUE OF HTML ELEMENT? ------------------

      // console.log(opt);
      // console.log(opt.value);

      // console.log("opts: "+opts);

      for (var i = 0; i < opts.length; i++) {
          // console.log(opts[i]);
          // console.log(opts[i].value);
          // console.log(i);
      }

    }
    else if ( this.type == 'time'){}
    else if ( this.type == 'date'){}
    else {}

    // HARDCODED VALUES for options ----------------------------
    this.thisQuestion.options.push('yes');
    this.thisQuestion.options.push('no');

    this.navCtrl.getPrevious().data.question_data = (this.thisQuestion? this.thisQuestion : null);
    this.navCtrl.pop();
  }
    
  closeQuestionModal() {
  	this.view.dismiss();
  }

}