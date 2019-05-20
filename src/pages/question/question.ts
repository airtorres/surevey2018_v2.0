import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';

import { ConfigurationProvider } from '../../providers/configuration/configuration';

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
    'isRequired': true
  };

  deleteFirstOptFlag = false;
  userCanLeave = true;
  addingFlag = false;
  leaveNowFlag = true;

  prev_first_opt;
  prev_qMsg;
  prev_anArray = [];
  prev_isRequired = true;

	public type;
  public anArray = [];
  isRequired = true;

 	constructor(public navCtrl: NavController, public navParams: NavParams, public view: ViewController,
    private alertCtrl: AlertController,
    public configService: ConfigurationProvider) {
		this.type = this.navParams.get('type');

    if(this.navParams.get('question_data')){
      console.log(this.navParams.get('question_data'));
      this.thisQuestion = this.navParams.get('question_data');
      this.type = this.thisQuestion['type'];
      this.isRequired = this.thisQuestion['isRequired'];

      if( this.thisQuestion['options'] ){
        for ( var opt = 0; opt < this.thisQuestion['options'].length; opt++ ){
          if( opt != 0){
            var val = {'value': this.thisQuestion['options'][opt]};
            this.anArray.push(val);
          }
        }
      }

      console.log(this.anArray);
    }

    // storing the previous values to check the changes
    this.prev_anArray = [];
    for (var i in this.anArray){
      this.prev_anArray.push(this.anArray[i]);
    }
    this.prev_anArray = JSON.stringify(this.prev_anArray);
    this.prev_isRequired = this.thisQuestion['isRequired'];
    this.prev_qMsg = this.thisQuestion? this.thisQuestion['message']: '';
    if(this.type == "multipleChoice" || this.type == "checkbox" || this.type == "dropdown"){
      this.prev_first_opt = this.thisQuestion['options'].length == 0? '':this.thisQuestion['options'][0];
    }
    else{
      this.prev_first_opt = '';
    }
  }

	ionViewDidLoad() {
  	console.log('ionViewDidLoad QuestionPage');
	}

  canAddQuestion(options, type){
    if (this.question && this.question.value != ''){
      var pattern = new RegExp("^([a-zA-Z0-9]+)([ \\.\\-\\,\\(\\)\\+\\$\\!\\?])*[a-zA-Z0-9]+");
      var isValidTitle = pattern.test(this.question.value);

      if(isValidTitle){
        if(options && options.length > 0 && (type == 'multipleChoice' || type == 'checkbox' || type == 'dropdown')){
          return true;
        }else if(type != 'multipleChoice' && type != 'checkbox' && type != 'dropdown'){
          return true;
        }else{
          this.configService.displayToast('You must have at least 1 option!');
        }
      }else{
        this.configService.displayToast('Invalid Question Message!');
      }
    }else{
      this.configService.displayToast('Empty Question Message!');
    }

    return false;
  }

  addQuestion(){
    console.log("question: "+ this.question.value);
    this.userCanLeave = true;
    this.addingFlag = true;

    this.thisQuestion['type'] = this.type;
    this.thisQuestion['message'] = (this.question ? this.question.value : "Missing Question");
    this.thisQuestion['isRequired'] = this.isRequired;

    if (this.type == 'multipleChoice' || this.type == 'checkbox' || this.type == 'dropdown'){
      console.log('this.anArray', this.anArray);

      if (this.type == 'multipleChoice' && !this.deleteFirstOptFlag){
        this.thisQuestion['options'][0] = this.firstOpt_multipleChoice.value;
      }
      else if (this.type == 'checkbox' && !this.deleteFirstOptFlag){
        this.thisQuestion['options'][0] = this.firstOpt_checkbox.value;
      }
      else if (this.type == 'dropdown' && !this.deleteFirstOptFlag){
        this.thisQuestion['options'][0] = this.firstOpt_dropdown.value;
      }

      if(this.deleteFirstOptFlag){
        this.thisQuestion['options'] = [];
      }else{
        // the first value will be saved and later on appended with values from anArray
        this.thisQuestion['options'] = this.thisQuestion['options'].splice(0, 1);
      }

      for( var opt in this.anArray){
        this.thisQuestion['options'].push(this.anArray[opt]['value']);
      }

    }
    else if ( this.type == 'time'){}
    else if ( this.type == 'date'){}
    else {}

    // removing the uncessesary empty item ont thisQuestion['options']
    var options = this.thisQuestion['options']? this.thisQuestion['options']: [];
    if (this.thisQuestion['options'] && this.thisQuestion['options'].length == 1){
      if(this.thisQuestion['options'][0] == ""){
        options = [];
      }
    }

    var valid = this.canAddQuestion(options, this.type);

    if(valid){
      this.navCtrl.getPrevious().data.question_data = (this.thisQuestion? this.thisQuestion : null);
      this.navCtrl.getPrevious().data.push_flag = true;
      if(this.navParams.get('question_data')){
        this.navCtrl.getPrevious().data.replace_flag = true;
        this.navCtrl.getPrevious().data.qID = this.navParams.get('qID_fromEdit');
      }

      if(this.leaveNowFlag){
        this.navCtrl.pop();
      }
    }
  }
    
  closeQuestionModal() {
    this.navCtrl.getPrevious().data.push_flag = false;
  	this.view.dismiss();
  }

  addMoreOption(){
    this.anArray? this.anArray.push({'value':''}):'';
  }

  removeOption(idx){
    if (idx == 'firstOpt_dropdown' || idx == 'firstOpt_checkbox' || idx == 'firstOpt_multipleChoice'){
      this.deleteFirstOptFlag = true;
      document.getElementById(idx+'_div').style.display = 'none';
    }else{
      this.anArray.splice(idx,1);
    }
  }

  checkAllChanges(){
    var exitFlag = false;

    if(this.type == "multipleChoice" && this.prev_first_opt == this.firstOpt_multipleChoice.value
      && this.prev_anArray == JSON.stringify(this.anArray)){
      exitFlag = true;
    }
    else if( this.type == "checkbox" && this.prev_first_opt == this.firstOpt_checkbox.value
      && this.prev_anArray == JSON.stringify(this.anArray)){
      exitFlag = true;
    }
    else if(this.type == "dropdown" && this.prev_first_opt == this.firstOpt_dropdown.value
      && this.prev_anArray == JSON.stringify(this.anArray)){
      exitFlag = true;
    }
    else if(this.type == "shortAnswer" || this.type == "longAnswer" || this.type == "date" || this.type == "time"){
      exitFlag = true;
    }

    if (exitFlag && this.prev_qMsg == this.question.value && this.prev_isRequired == this.isRequired){
      console.log("NO CHANGES MADE.");
      this.userCanLeave = true;
    }else{
      console.log("THERE ARE UNSAVED CHANGES.");
      this.userCanLeave = false;
    }
  }

  ionViewCanLeave() {
    console.log("checking the page if allowed to leave ...");
    this.checkAllChanges();

    // here you can use other vars to see if there are reasons we want to keep user in this page:
    if (!this.userCanLeave && !this.addingFlag) {
      return new Promise((resolve, reject) => {
        let alert = this.alertCtrl.create({
          title: 'Changes made',
          message: 'Do you want to save?',
          buttons: [
            {
              text: "Don't Save",
              handler: () => {
                this.userCanLeave = true;
                resolve();
              }
            },
            {
              text: 'Save',
              handler: () => {
                this.leaveNowFlag = false;
                this.addQuestion();
                resolve();
              }
            },
            {
              text: 'Cancel',
              role: 'cancel',
              handler: () => {
                this.userCanLeave = false;
                reject();
              }
            },
          ]
        });
        alert.present();
      });
    } else { return true }
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