import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { CreateSurveyPage } from '../create-survey/create-survey';

import { Storage } from '@ionic/storage';

@IonicPage()
@Component({
  selector: 'page-template-list',
  templateUrl: 'template-list.html',
})
export class TemplateListPage {

  built_in_templates = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private storage: Storage) {

    // load the built-in survey templates from local DB
    try{
      this.storage.get("built_in_templates").then( templates => {
        this.built_in_templates = [];
        for ( var temp in templates){
          this.built_in_templates.push(templates[temp]);
        }
      }).catch( error => {
        console.log("Problems with built_in_templates in Local Storage. ");
      });
    }catch (e){
      console.log("Problems with built_in_templates in Local Storage. ");
    }

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TemplateListPage');
  }

  edit_templates(title) {
    for( var temp in this.built_in_templates){
      if( this.built_in_templates[temp]['title'] == title){
        this.navCtrl.push(CreateSurveyPage, {surveyFromTemplate: this.built_in_templates[temp]});
      }
    }  	
  }

  public ionViewWillEnter() {
  }

}
