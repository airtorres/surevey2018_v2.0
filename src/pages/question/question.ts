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

  	isShortAnswer() {
		if (this.type == "shortAnswer") {
			return true;
		}
		return false;
	}

	isLongAnswer() {
		if (this.type == "longAnswer") {
			return true;
		}
		return false;
	}

  	isMultipleChoice() {
    	if (this.type == "multipleChoice") {
      		return true;
    	}
    	return false;
  	}

  	isCheckbox() {
    	if (this.type == "checkbox") {
      		return true;
    	}	
    	return false;
  	}

  	isDropdown() {
	    if (this.type == "dropdown") {
	      return true;
	    }
	    return false;
 	}
  	isDate() {
	  	if (this.type == "date") {
	      return true;
	    }
	    return false;
  	}
  	isTime() {
  		if (this.type == "time"){
  			return true;
  		}
  		return false;
  	}

  closeQuestionModal() {
  	this.view.dismiss();
  }

}